/** Short culture notes, shown one per day on the home screen. */

export interface CultureNote {
  id: string;
  title: string;
  text: string;
}

const c = (id: string, title: string, text: string): CultureNote => ({ id, title, text });

export const CULTURE: CultureNote[] = [
  c("shoes", "Shoes off at the entrance", "Many homes, some ryokan and some restaurants have a genkan, a lowered entrance where you take off your shoes and change into indoor slippers. Look for the step up before going further."),
  c("bow", "A small bow is a greeting", "Bowing is used to greet, thank and apologise. A slight nod is fine in casual moments; a deeper bow shows more respect."),
  c("itadakimasu", "Before and after meals", "People say いただきます before eating and ごちそうさまでした afterwards, to thank whoever prepared the food."),
  c("no-tips", "No tipping", "Tipping is not expected. Thank staff with ありがとうございました instead, and they will appreciate it."),
  c("konbini", "The convenience store", "Konbini sell hot meals, drinks and everyday items. They also pay bills, print documents and handle parcels. Staff greet every customer with いらっしゃいませ."),
  c("quiet-train", "Quiet on trains", "On trains people set their phones to silent and keep their voices low. Phone calls are usually left until the train has stopped."),
  c("priority-seats", "Priority seats", "Seats by the doors are kept free for older people, pregnant people and people with disabilities. If you are seated there, offer it up when someone needs it."),
  c("escalator", "Which side to stand", "In Tokyo people usually stand on the left of an escalator and leave the right free for walking. In Osaka the custom is the other way round."),
  c("onsen", "Onsen etiquette", "Wash thoroughly at the washing station before you enter the bath. Tie up long hair and keep your small towel out of the water."),
  c("tatami", "Tatami rooms", "Traditional rooms have tatami mats. Do not walk on them in shoes, and avoid stepping on the edges between mats."),
  c("hanami", "Cherry blossom viewing", "In spring people gather under the sakura for picnics called hanami. The blossom lasts only a week or two, which is why it is treasured."),
  c("obon", "Obon", "In mid-August many families visit the graves of their ancestors. Lanterns and bon odori dances welcome the spirits home."),
  c("oshogatsu", "New Year", "New Year (お正月) is the biggest holiday. Families eat osechi food, visit a shrine for the first time of the year (初詣) and send nengajo, New Year cards."),
  c("golden-week", "Golden Week", "Several national holidays fall in late April and early May. Many people travel, so trains and roads are very busy."),
  c("omikuji", "Fortune slips", "At shrines and temples you can draw a paper fortune (おみくじ). If it is bad, people often tie it to a branch so the bad luck stays behind."),
  c("greetings", "Time-of-day greetings", "おはようございます is for the morning, こんにちは for the daytime and こんばんは for the evening. Use them as you would “good morning” in English."),
  c("san", "Names and titles", "さん is the polite title for most people after their name. ちゃん is for children and close friends, and くん is common for boys and junior colleagues."),
  c("meishi", "Business cards", "Business cards (名刺) are offered and received with both hands. Read the card before you put it away, and treat it with care."),
  c("gifts", "Gifts", "Gifts are often given with both hands. People usually open a gift later rather than in front of the giver."),
  c("vending", "Vending machines", "You can buy hot and cold drinks almost everywhere from vending machines. In winter some sell hot canned coffee."),
  c("sorting", "Sorting rubbish", "Rubbish is sorted into burnable, non-burnable, recyclable and plastic. Each area posts its own rules at the collection point."),
  c("kotatsu", "Kotatsu", "A kotatsu is a low table with a heater underneath, covered by a quilt. In winter many families gather around one to eat and talk."),
  c("sento", "Public baths", "Neighbourhood bathhouses (銭湯) are fewer now, but some remain. The etiquette is the same as in an onsen."),
  c("karaoke", "Karaoke rooms", "Karaoke rooms are rented by the hour for a group. Most have food and drink menus, and you order from a tablet or phone on the wall."),
  c("izakaya", "Izakaya", "An izakaya is a casual pub that serves small dishes to share. Ordering several plates at once is normal, and the first drink is often part of the set."),
  c("ramen", "Ramen shops", "Many ramen shops sell meal tickets from a machine at the entrance. Hand the ticket to staff, eat quickly and leave the seat once you are done."),
  c("daruma", "Daruma dolls", "Daruma dolls are sold with blank eyes. You paint one eye when you set a goal and the other when it is achieved."),
  c("manga", "Manga reading", "Manga are read from right to left. Many learners start with graded readers or manga with furigana, which show the reading above each kanji."),
  c("kanji-origin", "Where kanji came from", "Kanji came from Chinese characters. Japanese mixes them with hiragana, which covers grammar and native words, and katakana, which is mostly for foreign words."),
  c("keigo", "Polite language", "Keigo is the most formal level of Japanese, used with customers, superiors and at formal events. です and ます are the best starting point."),
  c("shun", "Seasonal food", "The word 旬 (shun) means the time when a food is at its best. Menus often name the season, and people enjoy eating what is in shun."),
  c("kaiten", "Conveyor-belt sushi", "At kaiten-zushi the plates on the belt are priced by colour. Take what you like, and the plates are counted when you pay."),
  c("onigiri", "Onigiri", "Onigiri are rice balls, often wrapped in nori seaweed. Packaging usually has a tab that keeps the seaweed crisp until you eat."),
  c("chopsticks", "Chopsticks", "Never stand chopsticks upright in rice, because it resembles a funeral custom. Rest them on a holder or across the bowl when you pause."),
  c("noodles", "Slurping noodles", "Slurping noodles is normal and shows you are enjoying the food. Quiet eating is not expected."),
  c("calendar", "Dates", "Dates are written year, month, day: 2026年10月22日. The days of the week are 月火水木金土日, starting with Monday."),
  c("time", "Morning and afternoon", "Japanese puts 午前 (morning) or 午後 (afternoon) before the time: 午後三時 means three in the afternoon."),
  c("name-order", "Family name first", "Japanese names put the family name first: 田中太郎 is Tanaka Taro. People usually write their family name first on forms."),
  c("readings", "Two readings", "Many kanji have an on reading from Chinese and a kun reading from Japanese. Compounds usually use the on reading, and single words often use the kun reading."),
  c("matsuri", "Local festivals", "Local festivals (祭り) have food stalls, parades and portable shrines called mikoshi. Many take place in summer."),
  c("tanabata", "Tanabata", "On 7 July (or in August in some places) people write wishes on paper strips and hang them on bamboo branches."),
  c("setsubun", "Setsubun", "In early February people throw roasted beans to drive out bad luck, calling 鬼は外、福は内, “Demons out, luck in”."),
  c("hinamatsuri", "Hinamatsuri", "On 3 March families display hina dolls to wish girls health and happiness."),
  c("children-day", "Children’s Day", "On 5 May, koinobori carp streamers fly outside homes to wish boys strength and success."),
  c("train-time", "Train timing", "Trains run to tight timetables. If one is late, staff apologise, and passengers can ask for a delay certificate (遅延証明書) to show their employer or school."),
];
