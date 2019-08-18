import cogoToast, {Options} from 'cogo-toast';
import {PowerLocalize} from '../localization/PowerLocalizer';

export class Alerts {

    static options(hideTime: number): Options {
        return {
            position: 'bottom-left',
            hideAfter: hideTime,
            onClick: (hide: any) => {
                hide();
            },
        }
    }

    static showInfo(message) {
        cogoToast.info(message, Alerts.options(10));
    }

    static showSuccess(message) {
        cogoToast.success(message, Alerts.options(10));
    }

    static showLocalizedSuccess(key: string, ...args: string[]) {
        const msg = PowerLocalize.getFormatted(key, ...args);
        this.showSuccess(msg);
    }

    static showError(message) {
        cogoToast.error(message, Alerts.options(10));
    }
}
