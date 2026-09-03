package com.citylens.locationservice.dto.google;

import lombok.Data;

@Data
public class GooglePeriod {
    private GoogleTimePoint open;
    private GoogleTimePoint close;
}
