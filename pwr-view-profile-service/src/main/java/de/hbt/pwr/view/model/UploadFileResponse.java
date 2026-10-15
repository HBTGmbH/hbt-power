package de.hbt.pwr.view.model;

import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

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

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("fileId", fileId)
                .append("fileName", fileName)
                .append("fileDownloadUri", fileDownloadUri)
                .append("fileType", fileType)
                .append("size", size)
                .toString();
    }

}
