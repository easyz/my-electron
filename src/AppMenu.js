// const Electron = require('electron')
const { Menu, MenuItem, dialog } = require('electron')

const configFileMenu = new Menu();

function AddMenu() {
	const fileMenu = new Menu();
	fileMenu.append(new MenuItem({
		label: "打开文件",
		click: () => {
			dialog.showOpenDialog({ properties: ['openFile'] }).then((value) => {
				if (value.filePaths && value.filePaths[0]) {
					try {
						// let obj = JSON.parse(value.filePaths[0])
						SendMsgType("open-main-cfg", value.filePaths[0])
					} catch (error) {
						dialog.showErrorBox("错误", value.filePaths[0] + "，错误的文件格式！！！")
					}
				}
			})
		},
		enabled: true
	}))
	let menuItem = new MenuItem({ label: "Test", submenu: fileMenu });
	Menu.getApplicationMenu().append(menuItem)


	let menuConfigItem = new MenuItem({ label: "编辑器", submenu: configFileMenu });
	Menu.getApplicationMenu().append(menuConfigItem)
}


function AddConfigMenu(win, storage, ipList) {

	function CreateMenu(data) {
		return new MenuItem({
			label: data.name,
			click: () => {
				console.log(data.ip)
				win.loadURL(data.ip)
				storage.set('save_load_main_index', { mainIndex: data.ip }, function(error) {});
			},
			enabled: true
		})
	}

	for (var i = 0; i < ipList.length; i++) {
		var data = ipList[i]
		configFileMenu.append(CreateMenu(data))

	}
	
	
	// let menuConfigItem = new MenuItem({ label: "编辑器", submenu: configFileMenu });
	// Menu.getApplicationMenu().append(menuConfigItem)
}


exports.AddMenu = AddMenu
exports.AddConfigMenu = AddConfigMenu