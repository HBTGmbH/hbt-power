import {Project} from '../model/Project';
import {AbstractAction} from '../../profile/database-actions';

export interface ProjectUpdateAction extends AbstractAction{
    project:Project;
}