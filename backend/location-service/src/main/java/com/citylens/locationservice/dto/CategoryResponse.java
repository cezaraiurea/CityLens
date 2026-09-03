package com.citylens.locationservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {
    private Integer id;
    private String name;
    private String iconName;
    private String suggestedTime;
}
