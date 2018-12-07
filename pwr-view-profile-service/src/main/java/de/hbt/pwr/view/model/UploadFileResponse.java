package de.hbt.pwr.view.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UploadFileResponse {
    private String fileId;
    private String fileName;
    private String fileDownloadUri;
    private String fileType;
    private long size;

    public UploadFileResponse(){

    }

    public UploadFileResponse(String fileId, String fileName, String fileDownloadUri, String fileType, long size) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.fileDownloadUri = fileDownloadUri;
        this.fileType = fileType;
        this.size = size;
    }

    public static UploadFileResponse empty(){
        return new UploadFileResponse("","","","",0);
    }
}