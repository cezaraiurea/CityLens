package com.citylens.userservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteLocationDetails {
    private Long id;
    private String name;
    private String address;
    private BigDecimal rating;
    private List<String> photoUrls;
    private Integer priceLevel;
    private Map<String, Object> category;
}
