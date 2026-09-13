export class StorageManager{
    static DEFAULT_SETTINGS ={
        format: 'jpg',
        scale: 1.0,
        quality: 0.9,
    }

    static async getSettings(){
        try{
            const data = await browser.storage.local.get('userSettings');
            return {...StorageManager.DEFAULT_SETTINGS, ...(data.userSettings || {})};
        } catch (error) {
            console.error('Gagal baca storage, gunakan nilai default:', error);
            return StorageManager.DEFAULT_SETTINGS;
        }
    }
    
    static async saveSettings(newSettings){
        const currentSettings = await StorageManager.getSettings();
        const updatedSettings = {...currentSettings, ...newSettings};
        await browser.storage.local.set({userSettings: updatedSettings});
    }
}