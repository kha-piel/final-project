package org.example.util;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public final class ShuffleUtil {

    private ShuffleUtil() {
    }

    public static <T> void fisherYatesShuffle(List<T> list) {
        if (list == null || list.size() < 2) {
            return;
        }

        for (int i = list.size() - 1; i > 0; i--) {
            int j = ThreadLocalRandom.current().nextInt(i + 1);
            Collections.swap(list, i, j);
        }
    }
}
