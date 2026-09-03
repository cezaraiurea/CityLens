package com.citylens.locationservice.dto.google;

import lombok.Data;
import java.util.List;

@Data
public class GoogleOpeningHours {
    private List<GooglePeriod> periods;
}
