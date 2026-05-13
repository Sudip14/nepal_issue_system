import { useState, useCallback } from 'react';
import API from '../api/axios';

const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#fff' };

// Real Nepal location data
const NEPAL_DATA = {
  "Koshi Province": {
    "Taplejung": { municipalities: { "Taplejung Municipality": 9, "Phungling Municipality": 9, "Sirijangha Rural Municipality": 6, "Meringden Rural Municipality": 6, "Mikwakhola Rural Municipality": 6, "Sidingba Rural Municipality": 6, "Maiwakhola Rural Municipality": 6, "Phaktanglung Rural Municipality": 6, "Aathrai Triveni Rural Municipality": 9 } },
    "Sankhuwasabha": { municipalities: { "Khandbari Municipality": 11, "Chainpur Municipality": 9, "Dharmadevi Municipality": 9, "Panchakhapan Municipality": 9, "Madi Municipality": 7, "Sabhapokhari Rural Municipality": 6, "Makalu Rural Municipality": 6, "Chichila Rural Municipality": 6, "Hatuwagadhi Rural Municipality": 6, "Bhotkhola Rural Municipality": 5 } },
    "Bhojpur": { municipalities: { "Bhojpur Municipality": 10, "Shadananda Municipality": 9, "Aamchok Rural Municipality": 6, "Arun Rural Municipality": 6, "Hatuwagadhi Rural Municipality": 6, "Pauwadungma Rural Municipality": 6, "Ramprasad Rai Rural Municipality": 6, "Salpasilichho Rural Municipality": 6, "Tyamke Maiyum Rural Municipality": 6 } },
    "Dhankuta": { municipalities: { "Dhankuta Municipality": 14, "Pakhribas Municipality": 10, "Mahalaxmi Municipality": 9, "Chhathar Jorpati Rural Municipality": 6, "Sahidbhumi Rural Municipality": 6, "Sangurigadhi Rural Municipality": 6, "Tambapokhari Rural Municipality": 6 } },
    "Terhathum": { municipalities: { "Myanglung Municipality": 9, "Laligurans Municipality": 9, "Aathrai Rural Municipality": 6, "Chhathar Rural Municipality": 6, "Fedap Rural Municipality": 6, "Menchayem Rural Municipality": 6, "Phedap Rural Municipality": 7 } },
    "Solukhumbu": { municipalities: { "Solududhkunda Municipality": 11, "Dudhkoshi Rural Municipality": 7, "Khumbu Pasanglhamu Rural Municipality": 9, "Likhu Pike Rural Municipality": 6, "Mahakulung Rural Municipality": 7, "Necha Salyan Rural Municipality": 6, "Sotang Rural Municipality": 7, "Thulung Dudhkoshi Rural Municipality": 7 } },
    "Okhaldhunga": { municipalities: { "Siddhicharan Municipality": 13, "Molung Rural Municipality": 7, "Champadevi Rural Municipality": 6, "Chisankhugadhi Rural Municipality": 7, "Khijidemba Rural Municipality": 6, "Manebhanjyang Rural Municipality": 6, "Sunkoshi Rural Municipality": 7 } },
    "Khotang": { municipalities: { "Diktel Rupakot Majhuwagadhi Municipality": 13, "Halesi Tuwachung Municipality": 9, "Khotehang Rural Municipality": 7, "Aiselukharka Rural Municipality": 7, "Barahapokhari Rural Municipality": 6, "Diprung Chuichumba Rural Municipality": 7, "Jantedhunga Rural Municipality": 6, "Kepilasgadhi Rural Municipality": 6, "Rawabesi Rural Municipality": 7, "Sakela Rural Municipality": 6 } },
    "Udayapur": { municipalities: { "Triyuga Municipality": 14, "Katari Municipality": 9, "Belaka Municipality": 10, "Udayapurgadhi Rural Municipality": 6, "Chaudandigadhi Municipality": 9, "Rautamai Rural Municipality": 6, "Sunkoshi Rural Municipality": 6, "Tapli Rural Municipality": 6 } },
    "Sunsari": { municipalities: { "Inaruwa Municipality": 9, "Dharan Sub-Metropolitan City": 19, "Itahari Sub-Metropolitan City": 14, "Barahachhetra Municipality": 9, "Duhabi Municipality": 9, "Ramdhuni Municipality": 9, "Gadhi Rural Municipality": 6, "Harinagara Rural Municipality": 6, "Koshi Rural Municipality": 6 } },
    "Morang": { municipalities: { "Biratnagar Metropolitan City": 19, "Sundar Haraicha Municipality": 12, "Letang Bhogateni Municipality": 11, "Urlabari Municipality": 9, "Kanepokhari Rural Municipality": 6, "Gramthan Rural Municipality": 6, "Kerabari Municipality": 9, "Patahrishanishchare Municipality": 9, "Rangeli Municipality": 9, "Budhiganga Rural Municipality": 5, "Miklajung Rural Municipality": 6, "Jahada Rural Municipality": 6, "Dhanpalthan Rural Municipality": 6 } },
    "Jhapa": { municipalities: { "Mechinagar Municipality": 11, "Bhadrapur Municipality": 9, "Birtamod Municipality": 9, "Damak Municipality": 9, "Kankai Municipality": 9, "Shivasatakshi Municipality": 9, "Arjundhara Municipality": 9, "Buddhashanti Municipality": 9, "Gauriganj Rural Municipality": 6, "Haldibari Rural Municipality": 6, "Jhapa Rural Municipality": 7, "Kachankawal Rural Municipality": 6, "Kamal Rural Municipality": 6, "Barhadashi Rural Municipality": 6, "Maidhar Rural Municipality": 6 } },
    "Ilam": { municipalities: { "Ilam Municipality": 9, "Deumai Municipality": 9, "Mai Municipality": 9, "Suryodaya Municipality": 9, "Phakphokthum Rural Municipality": 6, "Chulachuli Rural Municipality": 6, "Maijogmai Rural Municipality": 6, "Mangsebung Rural Municipality": 6, "Rong Rural Municipality": 6, "Sandakpur Rural Municipality": 6 } },
    "Panchthar": { municipalities: { "Phidim Municipality": 9, "Miklajung Rural Municipality": 6, "Falgunanda Rural Municipality": 6, "Hillery Rural Municipality": 6, "Kummayak Rural Municipality": 6, "Phakel Rural Municipality": 6, "Phungling Rural Municipality": 6, "Tumbewa Rural Municipality": 6, "Yangwarak Rural Municipality": 6 } },
  },
  "Madhesh Province": {
    "Saptari": { municipalities: { "Rajbiraj Municipality": 9, "Kanchanrup Municipality": 9, "Dakneshwori Municipality": 9, "Tirhut Rural Municipality": 6, "Balan-Bihul Rural Municipality": 6, "Bishnupur Rural Municipality": 6, "Chhinnamasta Rural Municipality": 6, "Hanumannagar Kankalini Municipality": 9, "Mahadeva Rural Municipality": 6, "Rupani Rural Municipality": 6, "Saptakoshi Rural Municipality": 6, "Shambhunath Municipality": 9, "Surunga Municipality": 9 } },
    "Siraha": { municipalities: { "Lahan Municipality": 10, "Siraha Municipality": 9, "Dhangadhimai Municipality": 9, "Golbazar Municipality": 9, "Mirchaiya Municipality": 9, "Arnama Rural Municipality": 6, "Bariyarpatti Rural Municipality": 6, "Bhagawanpur Rural Municipality": 6, "Bishnupur Rural Municipality": 6, "Karjanha Rural Municipality": 6, "Naraha Rural Municipality": 6, "Nawarajpur Rural Municipality": 6, "Sakhuwanankarkatti Rural Municipality": 6, "Sukhipur Municipality": 9 } },
    "Dhanusha": { municipalities: { "Janakpurdham Sub-Metropolitan City": 18, "Dhanusha Rural Municipality": 6, "Aurahi Rural Municipality": 6, "Bateshwar Rural Municipality": 6, "Bideha Rural Municipality": 6, "Chhireshwornath Rural Municipality": 6, "Dhanauji Rural Municipality": 6, "Ganeshman Charnath Municipality": 9, "Hans Narayan Municipality": 9, "Janaki Rural Municipality": 6, "Kamala Municipality": 9, "Lakshminiya Rural Municipality": 6, "Mithila Municipality": 9, "Mithila Bihari Municipality": 9, "Mukhiyapatti Musarmiya Rural Municipality": 6, "Nagarain Municipality": 9, "Sabaila Municipality": 9, "Sahidnagar Municipality": 9, "Shreepratap Municipality": 9 } },
    "Mahottari": { municipalities: { "Jaleshwar Municipality": 9, "Bardibas Municipality": 9, "Gaushala Municipality": 9, "Balawa Rural Municipality": 6, "Bhangaha Municipality": 9, "Ekdara Rural Municipality": 6, "Loharpatti Rural Municipality": 6, "Mahottari Rural Municipality": 6, "Manara Shiswa Rural Municipality": 6, "Matihani Municipality": 9, "Pipra Rural Municipality": 6, "Ramgopalpur Municipality": 9, "Samsi Rural Municipality": 6, "Sonama Rural Municipality": 6 } },
    "Sarlahi": { municipalities: { "Malangwa Municipality": 9, "Lalbandi Municipality": 9, "Haripur Municipality": 9, "Bagmati Municipality": 9, "Barahathawa Municipality": 9, "Basbariya Rural Municipality": 6, "Bishnu Rural Municipality": 6, "Bramhapuri Rural Municipality": 6, "Chakraghatta Rural Municipality": 6, "Chandranagar Rural Municipality": 6, "Dhankaul Rural Municipality": 6, "Godaita Municipality": 9, "Haripurwa Municipality": 9, "Harion Municipality": 9, "Ishworpur Municipality": 9, "Kabilasi Municipality": 9, "Parsa Rural Municipality": 6, "Ramnagar Rural Municipality": 6 } },
    "Rautahat": { municipalities: { "Gaur Municipality": 9, "Chandrapur Municipality": 9, "Baudha Rural Municipality": 6, "Brindaban Rural Municipality": 6, "Dewahi Gonahi Municipality": 9, "Durga Bhagwati Rural Municipality": 6, "Garuda Municipality": 9, "Gadhimai Municipality": 9, "Gujara Rural Municipality": 6, "Ishnath Rural Municipality": 6, "Katahariya Municipality": 9, "Madhav Narayan Rural Municipality": 6, "Maulapur Municipality": 9, "Paroha Municipality": 9, "Phehelong Rural Municipality": 6, "Rajdevi Municipality": 9, "Rajpur Rural Municipality": 6, "Yamunamai Rural Municipality": 6 } },
    "Bara": { municipalities: { "Kalaiya Sub-Metropolitan City": 15, "Jitpur Simara Sub-Metropolitan City": 14, "Nijgadh Municipality": 9, "Kohalpur Rural Municipality": 6, "Adarshkotwal Rural Municipality": 6, "Baragadhi Rural Municipality": 6, "Baudhimai Municipality": 9, "Bhalwari Rural Municipality": 6, "Bishrampur Rural Municipality": 6, "Chakraghatta Rural Municipality": 6, "Devtal Rural Municipality": 6, "Feta Rural Municipality": 6, "Khairanikholagaun Rural Municipality": 6, "Mahagadhimai Municipality": 9, "Pachrauta Rural Municipality": 6, "Paroha Rural Municipality": 6, "Pheta Rural Municipality": 6, "Prasauni Rural Municipality": 6, "Simraungadh Municipality": 9, "Suvarna Rural Municipality": 6 } },
    "Parsa": { municipalities: { "Birgunj Metropolitan City": 19, "Pokhariya Municipality": 9, "Bahudarmai Municipality": 9, "Bind Rural Municipality": 6, "Chhipaharmai Rural Municipality": 6, "Dhobini Rural Municipality": 6, "Jagarnathpur Rural Municipality": 6, "Jirabhawani Rural Municipality": 6, "Kalikamai Rural Municipality": 6, "Pakaha Mainpur Rural Municipality": 6, "Parsagadhi Municipality": 9, "Paterwas Rural Municipality": 6, "Paterwa Sugauli Rural Municipality": 6, "Sakhuwa Prasauni Rural Municipality": 6, "Saudiyar Rural Municipality": 6, "Thori Rural Municipality": 6 } },
  },
  "Bagmati Province": {
    "Sindhuli": { municipalities: { "Kamalamai Municipality": 9, "Dudhmati Rural Municipality": 6, "Golanjor Rural Municipality": 6, "Hariharpurgadhi Rural Municipality": 6, "Marin Rural Municipality": 6, "Phikkal Rural Municipality": 6, "Sunkoshi Rural Municipality": 7, "Tinpatan Rural Municipality": 6 } },
    "Ramechhap": { municipalities: { "Manthali Municipality": 9, "Ramechhap Municipality": 9, "Doramba Rural Municipality": 6, "Gokulganga Rural Municipality": 6, "Khandadevi Rural Municipality": 6, "Likhu Tamakoshi Rural Municipality": 6, "Sunapati Rural Municipality": 6, "Umakunda Rural Municipality": 6 } },
    "Dolakha": { municipalities: { "Bhimeshwar Municipality": 10, "Jiri Municipality": 9, "Baiteshwar Rural Municipality": 6, "Bigu Rural Municipality": 6, "Gaurishankar Rural Municipality": 9, "Kalinchok Rural Municipality": 6, "Melung Rural Municipality": 6, "Sailung Rural Municipality": 6, "Tamakoshi Rural Municipality": 6 } },
    "Sindhupalchok": { municipalities: { "Chautara Sangachokgadhi Municipality": 11, "Melamchi Municipality": 9, "Bahrabise Municipality": 9, "Bhotekoshi Rural Municipality": 6, "Helambu Rural Municipality": 7, "Indrawati Rural Municipality": 7, "Jugal Rural Municipality": 6, "Larcha Rural Municipality": 6, "Lisankhu Pakhar Rural Municipality": 6, "Panchpokhari Thangpal Rural Municipality": 6, "Sunkoshi Rural Municipality": 6, "Tripurasundari Rural Municipality": 7 } },
    "Kavrepalanchok": { municipalities: { "Banepa Municipality": 9, "Dhulikhel Municipality": 9, "Panauti Municipality": 9, "Namobuddha Municipality": 9, "Khopasi Rural Municipality": 6, "Bethanchok Rural Municipality": 6, "Bhumlu Rural Municipality": 7, "Chaurideurali Rural Municipality": 6, "Mahabharat Rural Municipality": 6, "Mandan Deupur Municipality": 9, "Panchkhal Municipality": 9, "Roshi Rural Municipality": 6, "Temal Rural Municipality": 6 } },
    "Lalitpur": { municipalities: { "Lalitpur Metropolitan City": 29, "Godawari Municipality": 14, "Mahalaxmi Municipality": 10, "Bagmati Rural Municipality": 7, "Konjyosom Rural Municipality": 5, "Mahankal Rural Municipality": 6 } },
    "Bhaktapur": { municipalities: { "Bhaktapur Municipality": 10, "Madhyapur Thimi Municipality": 9, "Changunarayan Municipality": 9, "Suryabinayak Municipality": 9 } },
    "Kathmandu": { municipalities: { "Kathmandu Metropolitan City": 32, "Kirtipur Municipality": 10, "Budhanilkantha Municipality": 13, "Gokarneshwar Municipality": 9, "Shankharapur Municipality": 9, "Tarakeshwar Municipality": 11, "Tokha Municipality": 11, "Kageshwori Manohara Municipality": 9, "Chandragiri Municipality": 15, "Dakshinkali Municipality": 10, "Nagarjun Municipality": 10 } },
    "Nuwakot": { municipalities: { "Bidur Municipality": 9, "Belkotgadhi Municipality": 9, "Bhotenamlang Rural Municipality": 6, "Dupcheshwar Rural Municipality": 6, "Kakani Rural Municipality": 6, "Kispang Rural Municipality": 6, "Likha Rural Municipality": 6, "Myagang Rural Municipality": 6, "Panchakanya Rural Municipality": 6, "Shivapuri Rural Municipality": 6, "Suryagadhi Rural Municipality": 6, "Tadi Rural Municipality": 6, "Tarkeshwar Rural Municipality": 6 } },
    "Rasuwa": { municipalities: { "Rasuwa Rural Municipality": 6, "Amachodingmo Rural Municipality": 6, "Gosaikunda Rural Municipality": 6, "Kalika Rural Municipality": 6, "Naukunda Rural Municipality": 6 } },
    "Dhading": { municipalities: { "Nilkantha Municipality": 14, "Dhunibesi Municipality": 9, "Benighat Rorang Rural Municipality": 6, "Gajuri Rural Municipality": 6, "Galchi Rural Municipality": 6, "Gangajamuna Rural Municipality": 6, "Jwalamukhi Rural Municipality": 6, "Khaniyabas Rural Municipality": 6, "Netrawati Dabjong Rural Municipality": 6, "Rubi Valley Rural Municipality": 6, "Siddhalek Rural Municipality": 6, "Thakre Rural Municipality": 6, "Tripura Sundari Rural Municipality": 6 } },
    "Makwanpur": { municipalities: { "Hetauda Sub-Metropolitan City": 15, "Thaha Municipality": 9, "Bakaiya Rural Municipality": 6, "Bhimphedi Rural Municipality": 6, "Indrasarowar Rural Municipality": 6, "Kailash Rural Municipality": 6, "Makawanpurgadhi Rural Municipality": 6, "Manahari Rural Municipality": 6, "Raksirang Rural Municipality": 6 } },
    "Chitwan": { municipalities: { "Bharatpur Metropolitan City": 29, "Ratnanagar Municipality": 9, "Khairahani Municipality": 9, "Madi Municipality": 9, "Rapti Municipality": 9, "Ichchhakamana Rural Municipality": 6, "Kalika Municipality": 9, "Bharatpur Metropolitan City Ward 1-29": 29 } },
  },
  "Gandaki Province": {
    "Gorkha": { municipalities: { "Gorkha Municipality": 14, "Palungtar Municipality": 9, "Arughat Rural Municipality": 7, "Arpaghat Rural Municipality": 6, "Barpak Sulikot Rural Municipality": 9, "Bhimsenthapa Rural Municipality": 6, "Chumnubri Rural Municipality": 6, "Dharche Rural Municipality": 6, "Gandaki Rural Municipality": 6, "Sahid Lakhan Rural Municipality": 6, "Siranchok Rural Municipality": 8, "Sulikot Rural Municipality": 6, "Tsum Nubri Rural Municipality": 6 } },
    "Lamjung": { municipalities: { "Besisahar Municipality": 9, "Madhya Nepal Municipality": 9, "Sundarbazar Municipality": 9, "Dordi Rural Municipality": 6, "Dudhpokhari Rural Municipality": 6, "Kwholasothar Rural Municipality": 6, "Marsyangdi Rural Municipality": 6, "Rainas Municipality": 9 } },
    "Tanahun": { municipalities: { "Damauli Municipality": 11, "Byas Municipality": 11, "Bhanu Municipality": 9, "Bhimad Municipality": 9, "Myagde Rural Municipality": 6, "Anbukhaireni Rural Municipality": 6, "Bandipur Rural Municipality": 6, "Devghat Rural Municipality": 6, "Ghiring Rural Municipality": 6, "Rishing Rural Municipality": 6, "Shuklagandaki Municipality": 9 } },
    "Kaski": { municipalities: { "Pokhara Metropolitan City": 33, "Annapurna Rural Municipality": 6, "Machhapuchchhre Rural Municipality": 6, "Madi Rural Municipality": 6, "Rupa Rural Municipality": 6 } },
    "Manang": { municipalities: { "Chame Rural Municipality": 5, "Neshyang Rural Municipality": 5, "Narpa Bhumi Rural Municipality": 5, "Nasong Rural Municipality": 5 } },
    "Mustang": { municipalities: { "Waragung Muktikhsetra Rural Municipality": 5, "Gharapjhong Rural Municipality": 5, "Lomanthang Rural Municipality": 5, "Lo-Ghekar Damodarkunda Rural Municipality": 5, "Thasang Rural Municipality": 5 } },
    "Myagdi": { municipalities: { "Beni Municipality": 9, "Annapurna Rural Municipality": 6, "Dhaulagiri Rural Municipality": 6, "Mangala Rural Municipality": 6, "Malika Rural Municipality": 6, "Raghu Gandaki Rural Municipality": 6 } },
    "Parbat": { municipalities: { "Kushma Municipality": 9, "Phalewas Municipality": 9, "Bihadi Rural Municipality": 6, "Dhorpatan Municipality": 9, "Jaljala Rural Municipality": 6, "Mahashila Rural Municipality": 6, "Modi Rural Municipality": 6, "Painyu Rural Municipality": 6 } },
    "Baglung": { municipalities: { "Baglung Municipality": 14, "Dhorpatan Municipality": 9, "Bareng Rural Municipality": 6, "Badigad Rural Municipality": 6, "Galkot Municipality": 9, "Jaimuni Municipality": 9, "Kanthekhola Rural Municipality": 6, "Nisikhola Rural Municipality": 6, "Tara Hill Rural Municipality": 6 } },
    "Nawalpur": { municipalities: { "Kawasoti Municipality": 9, "Gaidakot Municipality": 9, "Devchuli Municipality": 9, "Bulingtar Rural Municipality": 6, "Madhyabindu Municipality": 9 } },
    "Syangja": { municipalities: { "Waling Municipality": 9, "Bhirkot Municipality": 9, "Arjunchaupari Rural Municipality": 6, "Biruwa Rural Municipality": 6, "Chapakot Municipality": 9, "Galyang Municipality": 9, "Harinas Rural Municipality": 6, "Kaligandaki Rural Municipality": 6, "Phedikhola Rural Municipality": 6, "Putalibazar Municipality": 9 } },
  },
  "Lumbini Province": {
    "Kapilvastu": { municipalities: { "Taulihawa Municipality": 9, "Buddhabhumi Municipality": 9, "Banganga Municipality": 9, "Bijaynagar Rural Municipality": 6, "Kapilvastu Municipality": 9, "Krishnanagar Municipality": 9, "Mayadevi Rural Municipality": 6, "Maharajgunj Municipality": 9, "Shivaraj Municipality": 9, "Suddhodhan Rural Municipality": 6, "Yashodhara Rural Municipality": 6 } },
    "Rupandehi": { municipalities: { "Butwal Sub-Metropolitan City": 19, "Lumbini Sanskritik Municipality": 9, "Devdaha Municipality": 9, "Sainamaina Municipality": 9, "Siddharthanagar Municipality": 9, "Kotahimai Rural Municipality": 6, "Kanchan Rural Municipality": 6, "Marchawari Rural Municipality": 6, "Mayadevi Rural Municipality": 6, "Omsatiya Rural Municipality": 6, "Rohini Rural Municipality": 6, "Sammarimai Rural Municipality": 6, "Siyari Rural Municipality": 6, "Sudhdhodhan Rural Municipality": 6, "Tilottama Municipality": 14 } },
    "Nawalparasi East": { municipalities: { "Gaindakot Municipality": 9, "Kawasoti Municipality": 9, "Bulingtar Rural Municipality": 6, "Devchuli Municipality": 9, "Madhyabindu Municipality": 9 } },
    "Nawalparasi West": { municipalities: { "Sunwal Municipality": 9, "Bardaghat Municipality": 9, "Pratappur Rural Municipality": 6, "Palhinandan Rural Municipality": 6, "Ramgram Municipality": 9, "Sarawal Rural Municipality": 6 } },
    "Palpa": { municipalities: { "Tansen Municipality": 9, "Rampur Municipality": 9, "Bagnaskali Rural Municipality": 6, "Baganaskhali Rural Municipality": 6, "Mathagadhi Rural Municipality": 6, "Nisdi Rural Municipality": 6, "Purbakhola Rural Municipality": 6, "Rambha Rural Municipality": 6, "Ribdikot Rural Municipality": 6, "Tinau Rural Municipality": 6 } },
    "Arghakhanchi": { municipalities: { "Sandhikharka Municipality": 9, "Sitganga Municipality": 9, "Bhumikasthan Municipality": 9, "Chhatradev Rural Municipality": 6, "Malarani Rural Municipality": 6, "Panini Rural Municipality": 6 } },
    "Gulmi": { municipalities: { "Tamghas Municipality": 9, "Musikot Municipality": 9, "Madane Rural Municipality": 6, "Chandrakot Rural Municipality": 6, "Chatrakot Rural Municipality": 6, "Gulmi Darbar Rural Municipality": 6, "Isma Rural Municipality": 6, "Kaligandaki Rural Municipality": 6, "Malika Rural Municipality": 6, "Resunga Municipality": 9, "Ruru Rural Municipality": 6, "Satyawati Rural Municipality": 6 } },
    "Pyuthan": { municipalities: { "Pyuthan Municipality": 9, "Sworgadwary Municipality": 9, "Airawati Rural Municipality": 6, "Gaumukhi Rural Municipality": 6, "Jhimruk Rural Municipality": 6, "Mallu Rural Municipality": 6, "Mandavi Rural Municipality": 6, "Naubahini Rural Municipality": 6, "Sarumarani Rural Municipality": 6 } },
    "Rolpa": { municipalities: { "Rolpa Municipality": 9, "Libang Municipality": 9, "Gangadeva Rural Municipality": 6, "Duikholi Rural Municipality": 6, "Lungri Rural Municipality": 6, "Madi Rural Municipality": 6, "Pariwartan Rural Municipality": 6, "Runtigadhi Rural Municipality": 6, "Sunchhahari Rural Municipality": 6, "Thabang Rural Municipality": 6, "Triveni Rural Municipality": 6 } },
    "Eastern Rukum": { municipalities: { "Bhume Rural Municipality": 5, "Putha Uttarganga Rural Municipality": 5, "Sisne Rural Municipality": 5 } },
    "Banke": { municipalities: { "Nepalgunj Sub-Metropolitan City": 24, "Kohalpur Municipality": 11, "Narainapur Rural Municipality": 6, "Baijanath Rural Municipality": 6, "Duduwa Rural Municipality": 6, "Janki Rural Municipality": 6, "Khajura Rural Municipality": 6, "Raptisonari Rural Municipality": 6 } },
    "Bardiya": { municipalities: { "Gulariya Municipality": 9, "Rajapur Municipality": 9, "Thakurbaba Municipality": 9, "Badhaiyatal Rural Municipality": 6, "Bansgadhi Municipality": 9, "Barbardiya Municipality": 9, "Geruwa Rural Municipality": 6, "Madhuwan Rural Municipality": 6 } },
    "Dang": { municipalities: { "Tulsipur Sub-Metropolitan City": 19, "Ghorahi Sub-Metropolitan City": 17, "Lamahi Municipality": 9, "Babai Rural Municipality": 6, "Banglachuli Rural Municipality": 6, "Dangisharan Rural Municipality": 6, "Gadhawa Rural Municipality": 6, "Rajpur Rural Municipality": 6, "Rapti Rural Municipality": 6, "Shantinagar Rural Municipality": 6 } },
  },
  "Karnali Province": {
    "Dolpa": { municipalities: { "Thuli Bheri Municipality": 9, "Tripurasundari Municipality": 9, "Chharka Tangsong Rural Municipality": 5, "Dolpo Buddha Rural Municipality": 5, "Jagdulla Rural Municipality": 5, "Kaike Rural Municipality": 5, "Mudkechula Rural Municipality": 5, "She Phoksundo Rural Municipality": 5, "Shey Phoksundo Rural Municipality": 5 } },
    "Mugu": { municipalities: { "Chhayanath Rara Municipality": 9, "Khatyad Rural Municipality": 5, "Mugum Karmarong Rural Municipality": 5, "Soru Rural Municipality": 5 } },
    "Humla": { municipalities: { "Simkot Rural Municipality": 5, "Adanchuli Rural Municipality": 5, "Chankheli Rural Municipality": 5, "Kharpunath Rural Municipality": 5, "Namkha Rural Municipality": 5, "Sarkegad Rural Municipality": 5, "Tanjakot Rural Municipality": 5 } },
    "Jumla": { municipalities: { "Chandannath Municipality": 9, "Kanakasundari Rural Municipality": 5, "Hima Rural Municipality": 5, "Patarasi Rural Municipality": 5, "Sinja Rural Municipality": 5, "Tatopani Rural Municipality": 5, "Tila Rural Municipality": 5 } },
    "Kalikot": { municipalities: { "Khandachakra Municipality": 9, "Mahawai Rural Municipality": 5, "Narharinath Rural Municipality": 5, "Pachaljharana Rural Municipality": 5, "Palata Rural Municipality": 5, "Pulu Rural Municipality": 5, "Raskot Municipality": 9, "Shubha Kalika Municipality": 9, "Sanni Triveni Rural Municipality": 5, "Tilagufa Municipality": 9 } },
    "Jajarkot": { municipalities: { "Bheri Municipality": 9, "Chhedagad Municipality": 9, "Barekot Rural Municipality": 6, "Junichande Rural Municipality": 6, "Kuse Rural Municipality": 6, "Nalgad Municipality": 9, "Shiwalaya Rural Municipality": 6 } },
    "Western Rukum": { municipalities: { "Aathbiskot Municipality": 9, "Banfikot Rural Municipality": 6, "Chaurjahari Municipality": 9, "Musikot Municipality": 9, "Sanibheri Rural Municipality": 6, "Triveni Rural Municipality": 6 } },
    "Salyan": { municipalities: { "Bangad Kupinde Municipality": 9, "Bagchaur Municipality": 9, "Kalimati Rural Municipality": 6, "Kapurkot Rural Municipality": 6, "Kumakh Rural Municipality": 6, "Sharada Municipality": 9, "Siddha Kumakh Rural Municipality": 6, "Tribeni Rural Municipality": 6 } },
    "Dailekh": { municipalities: { "Narayan Municipality": 9, "Dullu Municipality": 9, "Aathabis Municipality": 9, "Bhagawatimai Rural Municipality": 6, "Chamunda Bindrasaini Municipality": 9, "Gurans Rural Municipality": 6, "Mahabu Rural Municipality": 6, "Naumule Rural Municipality": 6, "Thantikandh Rural Municipality": 6 } },
    "Surkhet": { municipalities: { "Birendranagar Municipality": 11, "Gurbhakot Municipality": 9, "Bheriganga Municipality": 9, "Barahatal Rural Municipality": 6, "Chaukune Rural Municipality": 6, "Chingad Rural Municipality": 6, "Kalyal Rural Municipality": 6, "Kunathari Rural Municipality": 6, "Lekbesi Municipality": 9, "Panchapuri Municipality": 9, "Simta Rural Municipality": 6 } },
  },
  "Sudurpashchim Province": {
    "Bajura": { municipalities: { "Badimalika Municipality": 9, "Budhiganga Municipality": 9, "Budhinanda Municipality": 9, "Gaumul Rural Municipality": 6, "Himali Rural Municipality": 5, "Jagannath Rural Municipality": 5, "Khaptad Chhanna Rural Municipality": 5, "Swamikartik Khapar Rural Municipality": 5, "Triveni Rural Municipality": 5 } },
    "Bajhang": { municipalities: { "Bungal Municipality": 9, "Durgathali Rural Municipality": 5, "Jayaprithivi Municipality": 9, "Kedarsyu Rural Municipality": 5, "Khaptadchhanna Rural Municipality": 5, "Masta Rural Municipality": 5, "Saipal Rural Municipality": 5, "Surma Rural Municipality": 5, "Talkot Municipality": 9, "Thalara Rural Municipality": 5, "Thabang Rural Municipality": 5, "Bithadchir Rural Municipality": 5 } },
    "Darchula": { municipalities: { "Darchula Municipality": 9, "Mahakali Municipality": 9, "Api Rural Municipality": 5, "Byans Rural Municipality": 5, "Changru Rural Municipality": 5, "Dunhu Rural Municipality": 5, "Lekam Rural Municipality": 6, "Marma Rural Municipality": 6, "Naugad Rural Municipality": 5, "Shailyashikhar Municipality": 9 } },
    "Baitadi": { municipalities: { "Dasharathchand Municipality": 9, "Patan Municipality": 9, "Dilasaini Rural Municipality": 6, "Dogadakedar Rural Municipality": 6, "Melauli Municipality": 9, "Purchaudi Municipality": 9, "Shivanath Rural Municipality": 6, "Sigas Rural Municipality": 6, "Surnaya Rural Municipality": 6 } },
    "Dadeldhura": { municipalities: { "Amargadhi Municipality": 9, "Aalital Rural Municipality": 6, "Ajayameru Rural Municipality": 6, "Bhageshwar Rural Municipality": 6, "Ganyapadhura Rural Municipality": 6, "Navadurga Rural Municipality": 6, "Parashuram Municipality": 9 } },
    "Kanchanpur": { municipalities: { "Bhimdatta Municipality": 14, "Bedkot Municipality": 9, "Belauri Municipality": 9, "Beldandi Rural Municipality": 6, "Krishnapur Municipality": 9, "Laljhadi Rural Municipality": 6, "Mahakali Municipality": 9, "Punarbas Municipality": 9, "Shuklaphanta Municipality": 9 } },
    "Kailali": { municipalities: { "Dhangadhi Sub-Metropolitan City": 19, "Tikapur Municipality": 9, "Lamkichuha Municipality": 9, "Bhajani Municipality": 9, "Geta Rural Municipality": 6, "Bardagoriya Rural Municipality": 6, "Chure Rural Municipality": 6, "Gauriganga Municipality": 9, "Godawari Municipality": 9, "Janaki Rural Municipality": 6, "Joshipur Rural Municipality": 6, "Kailari Rural Municipality": 6, "Mohanyal Rural Municipality": 6, "Phatapur Rural Municipality": 6 } },
    "Accham": { municipalities: { "Mangalsen Municipality": 9, "Kamalbazar Municipality": 9, "Bannigadhi Jayagadh Rural Municipality": 5, "Chaurpati Rural Municipality": 6, "Dhakari Rural Municipality": 5, "Mellekh Rural Municipality": 5, "Panchadeval Binayak Municipality": 9, "Ramaroshan Rural Municipality": 5, "Sanfebagar Municipality": 9, "Turmakhand Rural Municipality": 5 } },
    "Doti": { municipalities: { "Dipayal Silgadhi Municipality": 9, "Shikhar Municipality": 9, "Aadarsha Rural Municipality": 6, "Badikedar Rural Municipality": 5, "Bogtan Fudsil Rural Municipality": 6, "Jorayal Rural Municipality": 6, "K I Singh Rural Municipality": 6, "Purbichauki Rural Municipality": 6, "Sayal Rural Municipality": 5 } },
    "Achham": { municipalities: { "Mangalsen Municipality": 9, "Kamalbazar Municipality": 9, "Sanfebagar Municipality": 9, "Panchadeval Binayak Municipality": 9, "Mellekh Rural Municipality": 5, "Chaurpati Rural Municipality": 6, "Ramaroshan Rural Municipality": 5, "Dhakari Rural Municipality": 5, "Bannigadhi Jayagadh Rural Municipality": 5, "Turmakhand Rural Municipality": 5 } },
  },
};

function IssueForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'road',
    severity: 2, address: '', ward_number: '',
    latitude: '27.7172', longitude: '85.3240',
    affected_people_count: 1,
    province: '', district: '', municipality: '',
  });

  // 🆕 MULTIPLE IMAGES STATE
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const provinces = Object.keys(NEPAL_DATA);
  const districts = form.province ? Object.keys(NEPAL_DATA[form.province]) : [];
  const municipalities = form.province && form.district
    ? Object.keys(NEPAL_DATA[form.province][form.district].municipalities)
    : [];
  const maxWards = form.province && form.district && form.municipality
    ? NEPAL_DATA[form.province][form.district].municipalities[form.municipality]
    : 0;
  const wardOptions = Array.from({ length: maxWards }, (_, i) => i + 1);

  const handleProvinceChange = (v) => {
    setForm(f => ({ ...f, province: v, district: '', municipality: '', ward_number: '' }));
  };
  const handleDistrictChange = (v) => {
    setForm(f => ({ ...f, district: v, municipality: '', ward_number: '' }));
  };
  const handleMunicipalityChange = (v) => {
    setForm(f => ({ ...f, municipality: v, ward_number: '' }));
  };

  // 🆕 HANDLE FILE SELECTION (multiple files)
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      if (!isValidType) alert(`❌ ${file.name} is not a valid image type (JPG, PNG, WEBP only)`);
      if (!isValidSize) alert(`❌ ${file.name} is too large (max 5MB)`);
      return isValidType && isValidSize;
    });

    if (images.length + validFiles.length > 5) {
      alert('❌ Maximum 5 images allowed');
      return;
    }

    const newImages = [...images, ...validFiles];
    const newPreviews = [...previews, ...validFiles.map(file => URL.createObjectURL(file))];

    setImages(newImages);
    setPreviews(newPreviews);
  };

  // 🆕 DRAG & DROP HANDLERS
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [images, previews]);

  // 🆕 REMOVE IMAGE
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke object URL to free memory
    URL.revokeObjectURL(previews[index]);

    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      // Combine address with location info
      const fullAddress = `${form.municipality ? form.municipality + ', ' : ''}${form.district ? form.district + ', ' : ''}${form.province ? form.province + ' - ' : ''}${form.address}`;
      Object.entries(form).forEach(([k, v]) => {
        if (!['province', 'district', 'municipality'].includes(k)) {
          formData.append(k, k === 'address' ? fullAddress : v);
        }
      });

      // 🆕 APPEND MULTIPLE IMAGES
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      await API.post('/api/issues/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Clean up preview URLs
      previews.forEach(url => URL.revokeObjectURL(url));

      onSuccess('Issue reported successfully!');
      setImages([]);
      setPreviews([]);
      setUploadProgress(0);
    } catch (err) {
      console.error('Upload error:', err);
      onSuccess('Failed to submit. Try again.');
    }
    setLoading(false);
  };

  const selectStyle = {
    ...inp,
    color: '#374151',
    appearance: 'auto',
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: 24, border: '0.5px solid #E2E8F0' }}>
      <h3 style={{ margin: '0 0 1rem', color: '#0F2044' }}>Report New Issue</h3>
      <form onSubmit={handleSubmit}>

        {/* Location Section */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px', marginBottom: 12, border: '1px solid #E2E8F0' }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#475569' }}>📍 Location</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select style={selectStyle} value={form.province} onChange={e => handleProvinceChange(e.target.value)} required>
              <option value="">Select Province</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select style={selectStyle} value={form.district} onChange={e => handleDistrictChange(e.target.value)} required disabled={!form.province}>
              <option value="">Select District</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select style={{ ...selectStyle, gridColumn: '1 / -1' }} value={form.municipality} onChange={e => handleMunicipalityChange(e.target.value)} required disabled={!form.district}>
              <option value="">Select Municipality / Rural Municipality</option>
              {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select style={selectStyle} value={form.ward_number} onChange={e => set('ward_number', e.target.value)} required disabled={!form.municipality}>
              <option value="">Select Ward</option>
              {wardOptions.map(w => <option key={w} value={w}>Ward {w}</option>)}
            </select>
            <input style={inp} placeholder="Landmark / Tole / Street" value={form.address} onChange={e => set('address', e.target.value)} required />
          </div>
        </div>

        {/* Issue Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input style={inp} placeholder="Issue title" value={form.title} onChange={e => set('title', e.target.value)} required />
          <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {[['road','🛣 Road'],['water','💧 Water'],['power','⚡ Power'],['waste','🗑 Waste'],['drainage','🌊 Drainage'],['sanitation','🚿 Sanitation'],['other','📌 Other']].map(([k,v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select style={selectStyle} value={form.severity} onChange={e => set('severity', +e.target.value)}>
            <option value={1}>🟢 Low</option>
            <option value={2}>🟡 Medium</option>
            <option value={3}>🟠 High</option>
            <option value={4}>🔴 Critical</option>
          </select>
          <input style={inp} type="number" placeholder="Affected people" value={form.affected_people_count} onChange={e => set('affected_people_count', +e.target.value)} min={1} />
        </div>

        <textarea
          style={{ ...inp, width: '100%', marginTop: 12, resize: 'vertical', boxSizing: 'border-box' }}
          rows={3} placeholder="Describe the issue..."
          value={form.description} onChange={e => set('description', e.target.value)} required
        />

        {/* 🆕 ENHANCED IMAGE UPLOAD — DRAG & DROP + MULTIPLE + GALLERY */}
        <div 
          style={{ 
            marginTop: 12, 
            padding: '20px', 
            border: isDragging ? '2px dashed #1D4ED8' : '2px dashed #CBD5E1', 
            borderRadius: 12, 
            background: isDragging ? '#EFF6FF' : '#F8FAFC',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('imageInput').click()}
        >
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            multiple
            onChange={e => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
          <p style={{ margin: '0 0 4px', fontSize: 14, color: '#374151', fontWeight: 500 }}>
            {isDragging ? 'Drop images here!' : 'Drag & drop images or click to browse'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
            JPG, PNG, WEBP up to 5MB each (max 5 images)
          </p>
        </div>

        {/* 🆕 IMAGE GALLERY PREVIEW */}
        {previews.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#475569' }}>
              📎 {previews.length} image{previews.length !== 1 ? 's' : ''} selected
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              {previews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    style={{ width: '100%', height: 100, objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                    style={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      background: '#DC2626', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      cursor: 'pointer', 
                      fontSize: 12, 
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: 10,
                    padding: '2px 6px',
                    textAlign: 'center'
                  }}>
                    {(images[index]?.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🆕 UPLOAD PROGRESS BAR */}
        {loading && uploadProgress > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#475569' }}>Uploading...</span>
              <span style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 600 }}>{uploadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ 
                width: `${uploadProgress}%`, 
                height: '100%', 
                background: '#1D4ED8', 
                borderRadius: 3,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, background: '#1D4ED8', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            {loading ? `Uploading ${uploadProgress}%...` : '📤 Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default IssueForm;