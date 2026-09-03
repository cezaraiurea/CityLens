package com.citylens.locationservice.dto;

import lombok.*;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpeningHourResponse {
    private Integer dayOfWeek;
    private LocalTime openTime;
    private LocalTime closeTime;
}
