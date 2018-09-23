export class Template{
    id: string;
    name:string;
    description: string;
    path: string;
    createUser: string;
    createdDate: string;


    constructor(template: Template){
        this.id = template.id;
        this.name = template.name;
        this.description = template.description;
        this.path = template.path;
        this.createUser = template.createUser;
        this.createdDate = template.createdDate;
    }


}