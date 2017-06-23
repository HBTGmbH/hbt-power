package de.hbt.pwr.service;

/**
 * Created by nt on 21.06.2017.
 */
public class IdGenerator {
    private static long idCounter = 0;

    public static synchronized Long createID()
    {
        return idCounter++;
    }
}
