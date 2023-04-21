mod rollinghash;

use std::collections::{BTreeSet, HashMap};
use tokenizer::Tokenizer;

type HashTable<'a> = HashMap<&'a str, BTreeSet<((usize, usize), i64)>>;
pub struct PlagiarismChecker<'a> {
    content_a: String,
    content_b: String,
    hash_table: HashTable<'a>,
    k_gram: usize,
}

impl<'a> PlagiarismChecker<'a> {
    pub fn new(content_a: String, content_b: String, k_gram: usize) -> Self {
        Self {
            content_a,
            content_b,
            k_gram,
            hash_table: HashMap::from([("a", BTreeSet::new()), ("b", BTreeSet::new())]),
        }
    }
    pub fn filter_content(&self, data: String) -> String {
        let stop_words = stop_words::get(stop_words::LANGUAGE::English);
        let tokenized_words = tokenizer::en::Tokenizer.tokenize(&data);
        let filtered: Vec<String> = tokenized_words
            .iter()
            .filter(|x| !stop_words.contains(&x.to_string()))
            .map(|x| porter_stemmer::stem(&*x.to_ascii_lowercase()))
            .collect();
        filtered.join(" ")
    }
    pub fn calculate_hash(&mut self, content: String, doc_type: &str) {
        let text = self.filter_content(content.clone());

        println!("{}", text);

        let mut text = rollinghash::RollingHash::new(text, self.k_gram, 26, 5807);

        for _ in 0..(content.len() - self.k_gram + 1) {
            self.hash_table
                .get_mut(doc_type)
                .unwrap()
                .insert(((text.window_start, text.window_end), text.hash));
            if !text.next_window() {
                break;
            }
        }
        println!("{:?}", self.hash_table)
    }

    pub fn calaculate_plagiarism_rate(&mut self) -> (BTreeSet<usize>, String, String, f64) {
        self.calculate_hash(self.content_a.clone(), "a");
        self.calculate_hash(self.content_b.clone(), "b");
        let th_a = self.hash_table["a"].len();
        let th_b = self.hash_table["b"].len();

        let a = &self.hash_table["a"];
        let b = &self.hash_table["b"];
        println!("{:?}", self.hash_table);
        let common = a
            .iter()
            .partition::<BTreeSet<((usize, usize), i64)>, _>(|x| {
                for y in b {
                    if y.1 == x.1 {
                        return true;
                    }
                }
                false
            });
        let sh = common.0.len();
        println!("\n{:?}\n", common.0);
        let mut matched_idx = BTreeSet::new();

        for (x, _) in &common.0 {
            for y in x.0..x.1 {
                matched_idx.insert(y);
            }
        }
        let content_a = self.filter_content(self.content_a.clone());
        let content_b = self.filter_content(self.content_b.clone());

        for x in &matched_idx {
            print!("{}", content_a.as_bytes()[*x] as char)
        }
        println!("\n{} {} {}", sh, th_a, th_b);

        let p = ((2 * sh) as f64 / (th_a + th_b) as f64) * 100.0;
        (matched_idx, content_a, content_b, p)
    }
}

pub fn robin_karp(
    user_content: String,
    source_content: String,
) -> (BTreeSet<usize>, String, String, f64) {
    let mut checker = PlagiarismChecker::new(user_content, source_content, 5);
    checker.calaculate_plagiarism_rate()
}
