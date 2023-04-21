pub struct RollingHash {
    pub hash: i64,
    text: String,
    pattern_size: usize,
    base: i64,
    pub window_start: usize,
    pub window_end: usize,
    modulo: i64,
}

impl RollingHash {
    pub fn new(text: String, pattern_size: usize, base: i64, modulo: i64) -> Self {
        let mut hash = 0;
        for i in 0..pattern_size {
            hash = (hash
                + (text.as_bytes()[i] as i64 - 96) as i64
                    * (base.pow((pattern_size - i - 1).try_into().unwrap())))
                % modulo;
        }

        Self {
            text,
            pattern_size,
            base,
            modulo,
            window_start: 0,
            window_end: pattern_size,
            hash,
        }
    }
    pub fn next_window(&mut self) -> bool {
        if self.window_end < self.text.len() {
            self.hash -= ((self.text.as_bytes()[self.window_start] as i64) - 96)
                * self.base.pow((self.pattern_size - 1).try_into().unwrap());

            self.hash *= self.base;
            self.hash += (self.text.as_bytes()[self.window_end] as i64) - 96;

            self.hash %= self.modulo;
            self.window_start += 1;
            self.window_end += 1;
            return true;
        }
        false
    }
}
