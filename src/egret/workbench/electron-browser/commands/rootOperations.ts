import { IOperation } from 'egret/platform/operations/common/operations';
import { IWindowClientService } from '../../../platform/windows/common/window';
import { Workbench } from '../workbench';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation';
import { InnerButtonType } from '../../../platform/innerwindow/common/innerWindows';
import { IDisposable, dispose } from '../../../base/common/lifecycle';
import { OperationBrowserService } from '../../../platform/operations/electron-browser/operationService';
import { onLauncherTask } from 'egret/platform/launcher/common/launcherHelper';
import Launcher from 'egret/platform/launcher/common/launcher';
import { AppId } from 'egret/platform/launcher/common/launcherDefines';
import { IWorkbenchEditorService } from 'egret/workbench/services/editor/common/ediors';
import { BaseEditor } from 'egret/editor/browser/baseEditor';
import { innerWindowManager } from 'egret/platform/innerwindow/common/innerWindowManager';
import { shell } from 'electron';

/**
 * 打开文件夹的操作
 */
export class OpenFolderOperation implements IOperation {
	constructor(@IWindowClientService private windowService: IWindowClientService) {
	}
	/**
	 * 运行
	 */
	public run(): Promise<any> {
		this.windowService.pickFolderAndOpen({});
		return Promise.resolve(void 0);
	}
	/**
	 * 释放
	 */
	public dispose(): void {
		this.windowService = null;
	}
}


/**
 * 弹出关于
 */
export class PromptAboutOperation implements IOperation {
	/**
	 * 运行
	 */
	public run(): Promise<any> {
		// if (innerWindowManager.tryActive(AboutPanel)) {
		// 	return Promise.resolve(void 0);
		// }
		// const about = new AboutPanel();
		// about.open(null, true);
		return Promise.resolve(void 0);
	}
	/**
	 * 释放
	 */
	public dispose(): void {
	}
}

/**
 * 反馈问题
 */
export class ReportIssueOperation implements IOperation {
	/**
	 * 运行
	 */
	public run(): Promise<any> {
		shell.openExternal('https://github.com/egret-labs/egret-ui-editor-opensource/issues');
		return Promise.resolve(void 0);
	}
	/**
	 * 释放
	 */
	public dispose(): void {
	}
}

/**
 * 快速打开运行
 */
export class PrompQuickOpenOperation implements IOperation {
	constructor(
		@IInstantiationService private instantiationService: IInstantiationService
	) {
	}
	/**
	 * 运行
	 */
	public run(): Promise<any> {
		// if (innerWindowManager.tryActive(SearchFilePanel)) {
		// 	return Promise.resolve(void 0);
		// }
		// const panel = this.instantiationService.createInstance(SearchFilePanel);
		// panel.open(null, true);
		return Promise.resolve(void 0);
	}
	/**
	 * 释放
	 */
	public dispose(): void {
	}
}


/**
 * 检查更新
 */
export class CheckUpdateOperation implements IOperation {
	/**
	 * 运行
	 */
	public run(): Promise<any> {
		onLauncherTask(Launcher.checkAppUpdate(AppId.EUIEditor));
		return Promise.resolve(void 0);
	}
	/**
	 * 释放
	 */
	public dispose(): void {
	}
}


/**
 * 检查更新
 */
export class FeedbackOperation implements IOperation {
	/**
	 * 运行
	 */
	public run(): Promise<any> {
		onLauncherTask(Launcher.feedback(AppId.EUIEditor));
		return Promise.resolve(void 0);
	}
	/**
	 * 释放
	 */
	public dispose(): void {
	}
}



/**
 * 关闭当前编辑器 
 */
export class CloseCurrentOperation implements IOperation {
	constructor(
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService,
	) { }
	/**
	 * 运行
	 */
	public run(): Promise<any> {
		const editor = this.editorService.getActiveEditor() as BaseEditor;
		if (editor instanceof BaseEditor) {
			return this.editorService.closeEditor(editor);
		}
		return Promise.resolve(void 0);
	}
	/**
	 * 释放
	 */
	public dispose(): void {
		this.editorService = null;
	}
}

