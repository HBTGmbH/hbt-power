export class Template {
    id: string;
    name: string;
    description: string;
    fileId:string;
    createUser: string;
    createdDate: string;
    previewId:string;

    constructor(template: Template) {
        this.id = template.id;
        this.name = template.name;
        this.description = template.description;
        this.fileId = template.fileId;
        this.createUser = template.createUser;
        this.createdDate = template.createdDate;
        this.previewId = template.previewId;
    }

    public static empty():Template{
        return new Template({id:"",name:"",description:"",fileId:"",createUser:"",createdDate:"",previewId:""});
    }
}


export class TemplateSlice {
    id: string;
    name: string;
    description: string;
    user: string;

    constructor(id: string, name: string, description: string, user: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.user = user;
    }
}