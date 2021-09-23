import { voluationToStyle } from "egret/base/common/dom";
import uri from "egret/base/common/uri";
import { PanelContentDom } from "egret/parts/browser/panelDom";
import { IFileService } from "egret/platform/files/common/files";
import { IInstantiationService } from "egret/platform/instantiation/common/instantiation";
import { INotificationService } from "egret/platform/notification/common/notifications";
import { FocusablePartCommandHelper, IFocusablePart } from "egret/platform/operations/common/operations";
import { IOperationBrowserService } from "egret/platform/operations/common/operations-browser";
import { IWorkspaceService } from "egret/platform/workspace/common/workspace";
import { IWorkbenchEditorService } from "../../../../services/editor/common/ediors";
import { IExplorerService } from "../../common/explorer";
import { FileStat, Model } from "../../common/explorerModel";

export class ExplorerView extends PanelContentDom implements IExplorerService, IFocusablePart {
	_serviceBrand: undefined;

	/** 控制是否在打开文件的时候自动选中资源管理器中的资源 */
	private autoReveal: boolean;

	private focusablePartCommandHelper: FocusablePartCommandHelper;

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
	select(resource: uri, reveal: boolean): Promise<void> {
		throw new Error("Method not implemented.");
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

	private createViewer(container: HTMLElement): void {
		const dataSource = this.instantiationService.createInstance(FileDataSource);
		const renderer = this.instantiationService.createInstance(FileRenderer);
		const controller = this.instantiationService.createInstance(FileController);
		this.disposables.push(controller);
		const sorter = this.instantiationService.createInstance(FileSorter);
		this.filter = this.instantiationService.createInstance(FileFilter);
		const dnd = this.instantiationService.createInstance(FileDragAndDrop2);

		this.disposables.push(this.fileService.onAfterOperation(e => this.fileOperation_handler(e)));
		this.disposables.push(this.fileService.onFileChanges(e => this.fileChanges_handler(e)));

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