import { voluationToStyle } from "egret/base/common/dom";
import URI from "egret/base/common/uri";
import uri from "egret/base/common/uri";
import * as paths from 'egret/base/common/paths';
import { PanelContentDom } from "egret/parts/browser/panelDom";
import { IFileService } from "egret/platform/files/common/files";
import { IInstantiationService } from "egret/platform/instantiation/common/instantiation";
import { INotificationService } from "egret/platform/notification/common/notifications";
import { FocusablePartCommandHelper, IFocusablePart } from "egret/platform/operations/common/operations";
import { IOperationBrowserService } from "egret/platform/operations/common/operations-browser";
import { IWorkspaceService } from "egret/platform/workspace/common/workspace";
import { IDisposable } from "vs/base/common/lifecycle";
import { Tree } from "vs/base/parts/tree/browser/treeImpl";
import { localize } from "vs/nls";
import { IWorkbenchEditorService } from "../../../../services/editor/common/ediors";
import { IExplorerService } from "../../common/explorer";
import { FileStat, Model } from "../../common/explorerModel";
import { FileDataSource, FileRenderer, FileController, FileSorter, FileFilter, FileDragAndDrop2 } from "./explorerViewer";

export class ExplorerView extends PanelContentDom implements IExplorerService, IFocusablePart {
	
	static readonly ID: string = 'workbench.explorer';
	static readonly TITLE: string = localize('explorerView.resourceManager', 'Explorer');

	_serviceBrand: undefined;

	/** 控制是否在打开文件的时候自动选中资源管理器中的资源 */
	private autoReveal: boolean;
	protected disposables: IDisposable[] = [];
	private focusablePartCommandHelper: FocusablePartCommandHelper;

	private explorerViewer: Tree;
	private filter: FileFilter;

	private get isCreated(): boolean {
		return !!(this.explorerViewer && this.explorerViewer.getInput());
	}

	private _model: Model;
	private get model(): Model {
		if (!this._model) {
			this._model = this.instantiationService.createInstance(Model);
		}
		return this._model;
	}

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IFileService private fileService: IFileService,
		@IWorkspaceService private workspaceService: IWorkspaceService,
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService,
		@INotificationService private notificationService: INotificationService,
		@IOperationBrowserService private operationService: IOperationBrowserService,
		@IExplorerService private explorerService: IExplorerService
	) {
		super(instantiationService);
		this.explorerService.init(this);
		this.autoReveal = true;

		this.focusablePartCommandHelper = this.instantiationService.createInstance(FocusablePartCommandHelper);
	}

	init(impl: IExplorerService): void {
		throw new Error("Method not implemented.");
	}
	getFileSelection(): FileStat[] {
		throw new Error("Method not implemented.");
	}
	getRoot(): uri {
		return this.model.root.resource;
	}
	getFirstSelectedFolder(): uri {
		throw new Error("Method not implemented.");
	}

	/**
	 * 根据指定的文件，选中并且使该项目可见。
	 */
	public select(resource: URI, reveal: boolean = this.autoReveal): Promise<void> {
		if (!resource) {
			return Promise.resolve(void 0);
		}
		//如果已经包含了选中，则调整一下可见位置，直接返回
		const selection = this.hasSingleSelection(resource);
		if (selection) {
			return reveal ? this.reveal(selection, 0.5) : Promise.resolve(void 0);
		}
		//还没创建完成
		if (!this.isCreated) {
			return Promise.resolve(void 0);
		}

		const fileStat = this.model.find(resource);
		if (fileStat) {
			return this.doSelect(fileStat, reveal);
		}

		return this.fileService.resolveFile(this.model.root.resource, [resource]).then(stat => {
			const modelStat = FileStat.create(stat, this.model.root, [resource]);
			FileStat.mergeLocalWithDisk(modelStat, this.model.root);
			return this.explorerViewer.refresh(this.model.root).then(() => this.doSelect(this.model.root.find(resource), reveal));
		}, e => {
			this.notificationService.error({ content: e, duration: 3 });
		});
	}

	/**
	 * 调整可视角位置到指定项
	 */
	private reveal(element: any, relativeTop?: number): Promise<void> {
		if (!this.explorerViewer) {
			return Promise.resolve();
		}
		return new Promise<void>((resolve, reject) => {
			this.explorerViewer.reveal(element, relativeTop).then(result => {
				resolve();
			}, error => {
				reject(error);
			});
		});
	}

	private doSelect(fileStat: FileStat, reveal: boolean): Promise<void> {
		if (!fileStat) {
			return Promise.resolve(void 0);
		}
		if (!this.filter.isVisible(this.explorerViewer, fileStat)) {
			fileStat = fileStat.parent;
			if (!fileStat) {
				return Promise.resolve(void 0);
			}
		}
		//调整视角到选中项
		let revealPromise: Promise<void>;
		if (reveal) {
			revealPromise = this.reveal(fileStat, 0.5);
		} else {
			revealPromise = Promise.resolve(void 0);
		}

		return revealPromise.then(() => {
			if (!fileStat.isDirectory) {
				this.explorerViewer.setSelection([fileStat]); // 选中文件
			}
			this.explorerViewer.setFocus(fileStat);
		});
	}

	getRelativeELement(): HTMLElement {
		throw new Error("Method not implemented.");
	}
	executeCommand<T>(command: string, ...args: any[]): Promise<T> {
		throw new Error("Method not implemented.");
	}
	hasCommand(command: string): boolean {
		throw new Error("Method not implemented.");
	}

	private getActiveFile(): URI {
		const input = this.editorService.getActiveEditorInput();
		if (input) {
			return input.getResource();
		}
		return null;
	}

	/**
 * 是否已包含选中
 * @param resource 
 */
	private hasSingleSelection(resource: URI): FileStat {
		const currentSelection: FileStat[] = this.explorerViewer.getSelection();
		return currentSelection.length === 1 && currentSelection[0].resource.toString() === resource.toString()
			? currentSelection[0]
			: undefined;
	}

	/**
	 * 滚动到选择文件
	 */
	private revealActiveFile(): void {
		if (!this.autoReveal) {
			return; // 如果 autoReveal === false 则不继续选择并滚动
		}

		let clearSelection = true;
		let clearFocus = false;

		// 当前激活的文件
		const activeFile = this.getActiveFile();
		if (activeFile) {
			//TODO 记录最后一次激活的文件
			if (this.isVisible()) {
				const selection = this.hasSingleSelection(activeFile);
				if (!selection) {
					this.select(activeFile);
				}
				clearSelection = false;
			}
		} else {
			//TODO 清空最后一次激活文件的记录
			clearFocus = true;
		}

		if (clearSelection) {
			this.explorerViewer.clearSelection();
		}
		if (clearFocus) {
			this.explorerViewer.clearFocus();
		}
	}

	private getResolvedDirectories(stat: FileStat, resolvedDirectories: URI[]): void {
		if (stat.isDirectoryResolved) {
			if (!stat.isRoot) {
				for (let i = resolvedDirectories.length - 1; i >= 0; i--) {
					const resource = resolvedDirectories[i];
					if (paths.isEqualOrParent(paths.normalize(stat.resource.fsPath), paths.normalize(resource.fsPath))) {
						resolvedDirectories.splice(i);
					}
				}
				resolvedDirectories.push(stat.resource);
			}
			for (let i = 0; i < stat.children.length; i++) {
				const child = stat.children[i];
				this.getResolvedDirectories(child, resolvedDirectories);
			}
		}
	}

	private doRefresh(targetsToExpand: URI[] = []): Promise<any> {
		const targetToResolve = { root: this.model.root, resource: this.model.root.resource, resolveTo: [] };
		if (!this.isCreated) {
			//TODO
		} else {
			this.getResolvedDirectories(targetToResolve.root, targetToResolve.resolveTo);
		}
		targetsToExpand.forEach(toExpand => {
			let has = false;
			for (let i = 0; i < targetToResolve.resolveTo.length; i++) {
				if ((targetToResolve.resolveTo[i] as URI).toString() == toExpand.toString()) {
					has = true;
					break;
				}
			}
			if (!has) {
				targetToResolve.resolveTo.push(toExpand);
			}
		});
		const promise = this.resolveRoots(targetToResolve, targetsToExpand);
		return promise;
	}

	private resolveRoots(targetToResolve: { root: FileStat, resource: URI, resolveTo: URI[] }, targetsToExpand: URI[]): Promise<any> {
		const input = this.model.root;

		const setInputAndExpand = (input: FileStat | Model, statsToExpand: FileStat[]) => {
			if (input === this.model && statsToExpand.every(fs => fs && !fs.isRoot)) {
				statsToExpand = [this.model.root].concat(statsToExpand);
			}
			return this.explorerViewer.setInput(input).then(() => this.explorerViewer.expandAll(statsToExpand));
		};
		if (!targetToResolve.resource) {
			const promise = this.explorerViewer.setInput(this.model);
			this.explorerViewer.layout();
			this.treeContainer.style.display = 'none';
			return new Promise<any>((resolve, reject) => {
				promise.then(() => {
					resolve(true);
				}, error => {
					reject(error);
				});
			});
		} else {
			this.treeContainer.style.display = '';
			return this.fileService.resolveFile(targetToResolve.resource, targetToResolve.resolveTo).then(result => {

				const fileStat = FileStat.create(result, targetToResolve.root, targetToResolve.resolveTo);
				FileStat.mergeLocalWithDisk(fileStat, this.model.root);

				const statsToExpand: FileStat[] = this.explorerViewer.getExpandedElements().concat(targetsToExpand.map(expand => this.model.find(expand)));
				if (input == this.explorerViewer.getInput()) {
					return this.explorerViewer.refresh().then(() => {
						return this.explorerViewer.expandAll(statsToExpand);
					});
				}
				const promise = setInputAndExpand(input, statsToExpand);
				this.explorerViewer.layout();
				return new Promise<any>((resolve, reject) => {
					promise.then(() => {
						resolve(true);
					}, error => {
						reject(error);
					});
				});
			});
		}
	}

	/**
	 * 创建
	 */
	public create(): Promise<void> {
		const targetsToExpand = [];
		//TODO 从持久化数据中读取需要打开的节点。
		return this.doRefresh(targetsToExpand).then(() => {
			this.disposables.push(this.editorService.onActiveEditorChanged(() => this.revealActiveFile()));
			this.revealActiveFile();
			return this.openDefaultFile();
		});
	}

	/**
	 * 打开默认文件，该文件由eui命令行指定
	 */
	private openDefaultFile(): Promise<void> {
		const workspace = this.workspaceService.getWorkspace();
		if (!workspace) {
			return Promise.resolve();
		}
		const file = workspace.file;
		if (!file) {
			return Promise.resolve();
		}
		return this.select(file, true).then(() => {
			if (this.hasSingleSelection(file)) {
				const extname = paths.extname(file.fsPath);
				if (extname === '.json') {
					this.editorService.openResEditor(file);
				} else {
					this.editorService.openEditor({ resource: file }, false);
				}
			}
		});
	}

	private createViewer(container: HTMLElement): void {
		const dataSource = this.instantiationService.createInstance(FileDataSource);
		const renderer = this.instantiationService.createInstance(FileRenderer);
		const controller = this.instantiationService.createInstance(FileController);
		this.disposables.push(controller);
		const sorter = this.instantiationService.createInstance(FileSorter);
		this.filter = this.instantiationService.createInstance(FileFilter);
		const dnd = this.instantiationService.createInstance(FileDragAndDrop2);

		// this.disposables.push(this.fileService.onAfterOperation(e => this.fileOperation_handler(e)));
		// this.disposables.push(this.fileService.onFileChanges(e => this.fileChanges_handler(e)));

		this.explorerViewer = this.instantiationService.createInstance(Tree, container,
			{
				dataSource: dataSource,
				renderer: renderer,
				controller: controller,
				dnd: dnd,
				sorter: sorter,
				filter: this.filter
			}, {
			autoExpandSingleChildren: true,
			keyboardSupport: true,
			ariaLabel: localize('explorerView.createViewer.fileResourceManager', 'File Explorer')
		});
	}

	private treeContainer: HTMLDivElement;
	render(container: HTMLElement) {
		this.doRender(container);
	}

	private doRender(container: HTMLElement): void {
		this.treeContainer = document.createElement('div');
		voluationToStyle(this.treeContainer.style, { width: '100%', height: '100%' });
		container.appendChild(this.treeContainer);
		//创建资源管理器的树
		this.createViewer(this.treeContainer);
		this.create();
		this.explorerViewer.layout();

	}
}
