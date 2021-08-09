
const path = require("path")
const fs = require('fs');
const lodash = require('lodash');
const json2lua = require('json2lua');
const exec = require('child_process').exec
const lua2json = require('lua2json');
const images = require("images");
const storage = require('electron-json-storage');
const gm = require('gm');
let assetsPath = path.join(process.cwd(), '/resources/assets')
const imageMagick = gm.subClass({ imageMagick: true, appPath: path.resolve(assetsPath, "imagemagick") + path.sep});

const { AddMenu, AddConfigMenu } = require("./src/AppMenu.js")
const { app, BrowserWindow, dialog, ipcMain, net } = require('electron')

let mainWin = null;

function SendMsg(rspData, retData) {
	mainWin.webContents.send('call-msg-ret', JSON.stringify({ type: rspData.type + "_" + rspData.index, data: retData }))
}


function SendMsgType(type, retData) {
	mainWin.webContents.send('send-msg', JSON.stringify({ type: type, data: retData }))
}
global.SendMsgType = SendMsgType

//接收
ipcMain.on('call-msg', function (event, args) { //news 是自定义的命令 ，只要与页面发过来的命令名字统一就可以
	//接收到消息后的执行程序
	let jsonData = JSON.parse(args)
	let rspData = jsonData.data
	// console.log(args)
	switch (jsonData.type) {
		case "dialog":
			// dialog.showOpenDialog({defaultPath: "E:/", properties: ['openFile', 'multiSelections'] })
			dialog.showOpenDialog(rspData).then((value) => {
				SendMsg(jsonData, value)
			})
			break
		case "dialog-msg":
			dialog.showMessageBox(rspData).then((value) => {
				SendMsg(jsonData, value)
			})
			break
		case "save-file":
			fs.writeFile(rspData.path, rspData.data, function () { })
			break
		case "crop-img":
			{
				let callback = function (err) {
					if (err) {
						console.log(err)
					}
				}
				for (var i = 0; i < rspData.saveList.length; i++) {
					var outData = rspData.saveList[i]
					imageMagick(rspData.src).crop(outData.width, outData.height, outData.x, outData.y).quality(rspData.quality || 100).write(outData.savePath, callback)
				}

				SendMsg(jsonData, true)
			}
			break
		case "exec":
			exec(rspData.command);
		case "eval-js":
			eval(rspData.command);
			SendMsg(jsonData, true)
			break
		case "call-json2lua": {
			let ret = json2lua[rspData.funcName].apply(json2lua, rspData.args)
			SendMsg(jsonData, ret)
		}
			break
		case "call-lua2json": {
			//fs.readFile(rspData.filePath, 'utf8', function (err, fileContent) {
			lua2json.parseFileRaw(rspData.content, function (err, result) {
				var out = []
				for (var i = 0; i < result.length; i++) {
					var ret = result[i]
					var out2 = {}
					for (var j = 0; j < ret._variables.length; j++) {
						var ret2 = ret._variables[j]
						out2[ret2.key] = ret2.value
					}
					out.push(out2)
				}
				SendMsg(jsonData, out)
			});
			//});
		}
			break
	}
})

function createWindow() {
	const win = mainWin = new BrowserWindow({
		width: 1200,
		height: 900,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			contextIsolation: false,
			preload: path.join(app.getAppPath(), 'preload.js')
		}

	})

	var cfgUrl = {}
	var cfgPath = path.join(path.dirname(process.execPath), 'url_cfg.json')
	if (fs.existsSync(cfgPath)) {
		try {
			cfgUrl = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'))
		} catch (e) {
			console.log(e)
		}
	}

	if (cfgUrl.index) {
		console.log("req 1")
		win.loadURL(cfgUrl.index)
	} else {

		var data = storage.getSync('save_load_main_index');
		if (!data || !data.mainIndex) {
			LoadConfig(function (obj) {
				var ipList = obj.ipList || []
				var outList = []
				for (var i = ipList.length - 1; i >= 0; i--) {
					outList.push(ipList[i].name)
				}
				var id = dialog.showMessageBoxSync({
					message: "启动工程",
					title: "开始",
					buttons: outList
				})
				win.loadURL(ipList[id].ip)
				storage.set('save_load_main_index', { mainIndex: ipList[id].ip }, function (error) { });
				console.log(id)
			})
		} else {
			console.log("req 3")
			win.loadURL(data.mainIndex)

			LoadConfig(function (obj) {
				AddConfigMenu(win, storage, obj.ipList || [])
			})
		}
		// storage.has('save_load_main_index', function(error, hasKey) {
		//   if (error) throw error;

		// 	if (hasKey) {
		// 		console.log('There is data stored as `foobar`');
		// 	}
		// });


		// console.log("req 2")
		// win.loadURL("http://192.168.50.245:3230/editor/index.html")
	}
}

function LoadConfig(cb) {
	const request = net.request('http://192.168.50.245:3230/editor/all_editor_config.json');
	// const request = net.request('http://192.168.1.97:5043/all_editor_config.json');
	request.on('response', (response) => {
		response.on("data", (chunk) => {
			console.log("get data ：", chunk.toString());
			cb(JSON.parse(chunk.toString()))
		})
		response.on('end', () => {
			console.log("get data finish !!!");
		})
	});
	//结束请求，不然没有响应数据
	request.end();
}

app.whenReady().then(() => {

	AddMenu()
	createWindow()

	console.log(process.env.npm_package_version)
	console.log(process.versions)

	// var callback = function(err) {
	// 	if (err) {
	// 		console.log(err)
	// 	}
	// }
	// imageMagick("F:\\map_bairimen.jpg").autoOrient().write('F:\\map_bairimen111.jpg', callback);
	// imageMagick('F:\\map_bairimen.jpg').resize(240, 240, "!").quality(100).write("F:\\map_bairimen111.jpg",function(err){err&&console.log(err)})
	// imageMagick('F:\\map_bairimen.jpg').crop(40, 40, 10, 10).quality(100).write("F:\\map_bairimen11122.jpg",callback)

	// var img = gm("F:\\map_bairimen.jpg");

	// gm("F:\\map_bairimen.jpg").crop(600, 600, 600, 600).write("F:\\map_bairimen111.jpg", err => {
	// gm("F:\\map_bairimen.jpg")
	// .write("F:\\map_bairimen111.jpg", err => {
	// 	if (err != null) {
	// 		console.log(err);
	// 	}
	// })

	// gm("F:\\map_bairimen.jpg").crop(600, 600, 0, 0).quality(100).write("F:\\map_bairimen11122.jpg", err => {
	// 	if (err != null) {
	// 		console.log(err);
	// 	}
	// })


	// .crop(600, 600, 600, 600)
	// .quality(val)
	// .write("F:\\map_bairimen111.jpg", err => {
	// 	if(err != null){
	// 		console.log(err);
	// 	}
	// }
	// );

	// var buffer = fs.readFileSync("F:\\map_bairimen.jpg")
	// var srcImg = images(buffer)
	// console.log(srcImg)
	// images(srcImg, 0, 0, 512, 512).save("F:\\map_bairimen111.jpg", {quality: 100})
	// for (var i = 0; i < rspData.saveList.length; i++) {
	// 	var outData = rspData.saveList[i]
	// 	images(srcImg, outData.x, outData.y, outData.width, outData.height).save(outData.savePath, {quality: rspData.quality || 100})
	// }
	// SendMsg(jsonData, true)
	// exec("TortoiseProc.exe /command:commit /path:\"E:/develop_ww/schong_ww/minigame\" /logmsg:update_new_ver /closeonend:0")
})


