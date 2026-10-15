import cogoToast, {CTOptions} from '@successtar/cogo-toast';
import {PowerLocalize} from '../localization/PowerLocalizer';

const options = (hideTime: number): CTOptions => {
    return {
        position: 'bottom-left',
        hideAfter: hideTime,
    };
}

export class Alerts {

    static showInfo(message) {
        const {hide} = cogoToast.info(message,{...options(10), onClick: () => hide()});
    }

    static showSuccess(message) {
        const {hide} = cogoToast.success(message, {...options(10), onClick: () => hide()});
    }

    static showLocalizedSuccess(key: string, ...args: string[]) {
        const msg = PowerLocalize.getFormatted(key, ...args);
        this.showSuccess(msg);
    }

    static showError(message) {
        const {hide} = cogoToast.error(message, {...options(10), onClick: () => hide()});
    }
}
