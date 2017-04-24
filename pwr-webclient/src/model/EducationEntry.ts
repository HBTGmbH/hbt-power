import {Education} from './Education';
import {APIEducation} from './APIProfile';

export class EducationEntry {
    id: number;
    date: Date;
    educationId: number;

    public static toAPIEducationEntry(entry: EducationEntry, educationsById: Array<Education>): APIEducation {
        return {
            id: entry.id,
            date: entry.date.toDateString(),
            education: {
                id: entry.educationId,
                name: educationsById[entry.educationId].name
            }
        }
    }
}