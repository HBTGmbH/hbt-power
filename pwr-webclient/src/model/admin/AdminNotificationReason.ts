export enum AdminNotificationReason {
    PROFILE_UPDATED,
    /**
     * A new {@link NameEntity} that previously was unknown
     * has been added.
     */
    NAME_ENTITY_ADDED,

    /**
     * A new dangerous Skill has been added.
     * Claimed as dangerous, because it was not known before that
     */
    DANGEROUS_SKILL_ADDED_UNKNOWN,

    /**
     * A new dangerous Skill has been added.
     * Claimed as dangerous, because its blacklisted
     */
    DANGEROUS_SKILL_ADDED_BLACKLISTED
}

export class AdminNotificationReasonUtil {

    public static keys(): Array<number> {
        return Object.keys(AdminNotificationReason)
            .filter(key => !isNaN(Number(AdminNotificationReason[key])))
            .map(key => Number(key));
    }

    public static fromString(reason: string): AdminNotificationReason {
        for (let key in AdminNotificationReasonUtil.keys()) {
            if (AdminNotificationReason[key] === reason) {
                return key as any as number;
            }
        }
        return undefined;
    }
}
