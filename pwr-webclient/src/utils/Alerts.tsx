import cogoToast, {Options} from 'cogo-toast';

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

    static showError(message) {
        cogoToast.error(message, Alerts.options(10));
    }
}
