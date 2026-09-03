package com.citylens.userservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class JournalRequest {

    private List<String> photoUrls;
    private String journalNote;
}
