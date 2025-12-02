package com.store.BACK;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class        JapaunderApplication {

    public static void main(String[] args) {
        SpringApplication.run(JapaunderApplication.class, args);
    }
}   