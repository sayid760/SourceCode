import { MOUNTED, UNMOUNTING, NOT_MOUNTED } from "../applications/app.helpers";
export async function toUnmountPromise(app) {
    console.log('toUnmountPromise app', app)
    // 当前应用没有被挂载直接什么都不做了
    if (app.status != MOUNTED) {
        return app;
    }
    app.status = UNMOUNTING;
    console.log('[customProps]', app.customProps)
    await app.unmount(app.customProps)
    app.status = NOT_MOUNTED;
    return app;
}