export class Template {
    id: string;
    name: string;
    description: string;
    path: string;
    createUser: string;
    createdDate: string;

    constructor(template: Template) {
        this.id = template.id;
        this.name = template.name;
        this.description = template.description;
        this.path = template.path;
        this.createUser = template.createUser;
        this.createdDate = template.createdDate;
    }
}


export class TemplateSlice {
    id: string;
    name: string;
    description: string;
    path: string;

    constructor(id: string, name: string, description: string, path: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.path = path;
    }
}