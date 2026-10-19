// Comprehensive Geolocation and Administrative Divisions Catalog
// Covers USA (50 States + DC + Major Cities), Bangladesh (8 Divisions + 64 Districts + Upazilas),
// Canada (Provinces + Cities), UK (Regions + Cities), Australia (States + Cities), and Worldwide Countries.

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  hasSubdivisions: boolean;
  subdivisionLabel: 'State' | 'Division' | 'Province' | 'Region' | 'State / Province';
}

export interface Subdivision {
  code: string;
  name: string;
  cities: string[];
}

export const COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', hasSubdivisions: true, subdivisionLabel: 'State' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', hasSubdivisions: true, subdivisionLabel: 'Division' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', hasSubdivisions: true, subdivisionLabel: 'Province' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', hasSubdivisions: true, subdivisionLabel: 'Region' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', hasSubdivisions: true, subdivisionLabel: 'State' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', hasSubdivisions: false, subdivisionLabel: 'State' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', hasSubdivisions: false, subdivisionLabel: 'State' },
];

// 50 US States + District of Columbia with key metropolitan cities
export const US_STATES: Subdivision[] = [
  { code: 'AL', name: 'Alabama', cities: ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa', 'Auburn'] },
  { code: 'AK', name: 'Alaska', cities: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'] },
  { code: 'AZ', name: 'Arizona', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe'] },
  { code: 'AR', name: 'Arkansas', cities: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'] },
  { code: 'CA', name: 'California', cities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Irvine'] },
  { code: 'CO', name: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder'] },
  { code: 'CT', name: 'Connecticut', cities: ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury'] },
  { code: 'DE', name: 'Delaware', cities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'] },
  { code: 'FL', name: 'Florida', cities: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Boca Raton', 'Tampa Bay'] },
  { code: 'GA', name: 'Georgia', cities: ['Atlanta', 'Columbus', 'Augusta', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell'] },
  { code: 'HI', name: 'Hawaii', cities: ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua'] },
  { code: 'ID', name: 'Idaho', cities: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell'] },
  { code: 'IL', name: 'Illinois', cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria', 'Schaumburg'] },
  { code: 'IN', name: 'Indiana', cities: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington'] },
  { code: 'IA', name: 'Iowa', cities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'] },
  { code: 'KS', name: 'Kansas', cities: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence'] },
  { code: 'KY', name: 'Kentucky', cities: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'] },
  { code: 'LA', name: 'Louisiana', cities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Metairie', 'Lafayette'] },
  { code: 'ME', name: 'Maine', cities: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'] },
  { code: 'MD', name: 'Maryland', cities: ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Rockville', 'Gaithersburg', 'Bethesda', 'Frederick'] },
  { code: 'MA', name: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy', 'Lynn', 'Newton'] },
  { code: 'MI', name: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Dearborn', 'Troy', 'Flint'] },
  { code: 'MN', name: 'Minnesota', cities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Bloomington', 'Duluth', 'Brooklyn Park', 'Plymouth'] },
  { code: 'MS', name: 'Mississippi', cities: ['Jackson', 'Gulfport', 'Southaven', 'Biloxi', 'Hattiesburg'] },
  { code: 'MO', name: 'Missouri', cities: ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence'] },
  { code: 'MT', name: 'Montana', cities: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena'] },
  { code: 'NE', name: 'Nebraska', cities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'] },
  { code: 'NV', name: 'Nevada', cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'] },
  { code: 'NH', name: 'New Hampshire', cities: ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester'] },
  { code: 'NJ', name: 'New Jersey', cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Trenton', 'Clifton', 'Cherry Hill'] },
  { code: 'NM', name: 'New Mexico', cities: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'] },
  { code: 'NY', name: 'New York', cities: ['New York City (Manhattan)', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'White Plains', 'Hempstead'] },
  { code: 'NC', name: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'Asheville'] },
  { code: 'ND', name: 'North Dakota', cities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'] },
  { code: 'OH', name: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton'] },
  { code: 'OK', name: 'Oklahoma', cities: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton'] },
  { code: 'OR', name: 'Oregon', cities: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend'] },
  { code: 'PA', name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Reading', 'Erie', 'Upper Darby', 'Scranton', 'Bethlehem', 'Lancaster'] },
  { code: 'RI', name: 'Rhode Island', cities: ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'] },
  { code: 'SC', name: 'South Carolina', cities: ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville'] },
  { code: 'SD', name: 'South Dakota', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'] },
  { code: 'TN', name: 'Tennessee', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin'] },
  { code: 'TX', name: 'Texas', cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Irving', 'Frisco', 'Garland', 'McKinney'] },
  { code: 'UT', name: 'Utah', cities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden'] },
  { code: 'VT', name: 'Vermont', cities: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'] },
  { code: 'VA', name: 'Virginia', cities: ['Virginia Beach', 'Chesapeake', 'Norfolk', 'Arlington', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Fairfax', 'McLean', 'Tysons'] },
  { code: 'WA', name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley', 'Federal Way'] },
  { code: 'WV', name: 'West Virginia', cities: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'] },
  { code: 'WI', name: 'Wisconsin', cities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha'] },
  { code: 'WY', name: 'Wyoming', cities: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'] },
  { code: 'DC', name: 'District of Columbia', cities: ['Washington D.C.'] },
];

// All 8 Divisions of Bangladesh + All 64 Districts + Key Upazilas / Thanas
export interface BangladeshDivision {
  division: string;
  districts: {
    name: string;
    thanas: string[];
  }[];
}

export const BANGLADESH_DIVISIONS: BangladeshDivision[] = [
  {
    division: 'Dhaka',
    districts: [
      { name: 'Dhaka', thanas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Motijheel', 'Badda', 'Khilgaon', 'Old Dhaka', 'Tejgaon', 'Paltan', 'Savar', 'Keraniganj', 'Dhamrai', 'Nawabganj', 'Dohar'] },
      { name: 'Gazipur', thanas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'] },
      { name: 'Narayanganj', thanas: ['Narayanganj Sadar', 'Bandar', 'Fatullah', 'Siddhirganj', 'Araihazar', 'Sonargaon', 'Rupganj'] },
      { name: 'Tangail', thanas: ['Tangail Sadar', 'Mirzapur', 'Ghatail', 'Madhupur', 'Sakhipur', 'Kalihati', 'Bhuapur', 'Gopalpur', 'Basail', 'Nagarpur', 'Delduar'] },
      { name: 'Kishoreganj', thanas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Katiadi', 'Kuliarchar', 'Pakundia', 'Hossainpur', 'Karimganj', 'Tarail', 'Itna', 'Mithamain', 'Austagram', 'Nikli'] },
      { name: 'Manikganj', thanas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Shivalaya', 'Harirampur', 'Ghior', 'Daulatpur'] },
      { name: 'Munshiganj', thanas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Lohajang', 'Tongibari', 'Gazaria'] },
      { name: 'Narsingdi', thanas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Belabo', 'Monohardi', 'Raipura'] },
      { name: 'Faridpur', thanas: ['Faridpur Sadar', 'Boalmari', 'Alfadanga', 'Madhukhali', 'Bhanga', 'Nagarkanda', 'Charbhadrasan', 'Sadarpur', 'Saltha'] },
      { name: 'Gopalganj', thanas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
      { name: 'Madaripur', thanas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir'] },
      { name: 'Rajbari', thanas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi', 'Kalukhali'] },
      { name: 'Shariatpur', thanas: ['Shariatpur Sadar', 'Zajira', 'Naria', 'Bhedarganj', 'Damudya', 'Gosairhat'] },
    ],
  },
  {
    division: 'Chattogram',
    districts: [
      { name: 'Chattogram', thanas: ['Kotwali', 'Panchlaish', 'Double Mooring', 'Halishahar', 'Pahartali', 'Chandgaon', 'Khulshi', 'Bayezid', 'Patenga', 'Bakalia', 'Hathazari', 'Raozan', 'Patiya', 'Sitakunda', 'Mirsharai', 'Boalkhali', 'Anwara', 'Chandanaish', 'Fatikchhari', 'Satkania', 'Lohagara', 'Banshkhali', 'Sandwip'] },
      { name: 'Cox\'s Bazar', thanas: ['Cox\'s Bazar Sadar', 'Ramu', 'Chakaria', 'Ukhia', 'Teknaf', 'Maheshkhali', 'Kutubdia', 'Pekua'] },
      { name: 'Cumilla', thanas: ['Cumilla Adarsha Sadar', 'Cumilla Sadar Dakshin', 'Daudkandi', 'Chandina', 'Burichang', 'Brahmanpara', 'Debidwar', 'Homna', 'Muradnagar', 'Titas', 'Barura', 'Laksam', 'Chauddagram', 'Nangalkot', 'Meghna', 'Monohargonj', 'Lalmai'] },
      { name: 'Feni', thanas: ['Feni Sadar', 'Daganbhuiyan', 'Chhagalnaiya', 'Parshuram', 'Sonagazi', 'Fulgazi'] },
      { name: 'Brahmanbaria', thanas: ['Brahmanbaria Sadar', 'Ashuganj', 'Sarail', 'Nasirnagar', 'Nabinagar', 'Bancharampur', 'Kasba', 'Akhaura', 'Bijoynagar'] },
      { name: 'Noakhali', thanas: ['Noakhali Sadar (Sudharam)', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'] },
      { name: 'Chandpur', thanas: ['Chandpur Sadar', 'Faridganj', 'Hajiganj', 'Haimchar', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'] },
      { name: 'Lakshmipur', thanas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
      { name: 'Rangamati', thanas: ['Rangamati Sadar', 'Kaptai', 'Kaukhali', 'Baghaichhari', 'Barkal', 'Langadu', 'Rajasthali', 'Belaichhari', 'Juraichhari', 'Naniarchar'] },
      { name: 'Khagrachhari', thanas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga', 'Manikchhari', 'Ramgarh', 'Guimara', 'Lakshmichhari'] },
      { name: 'Bandarban', thanas: ['Bandarban Sadar', 'Ruma', 'Thanchi', 'Rowangchhari', 'Lama', 'Alikadam', 'Naikhongchhari'] },
    ],
  },
  {
    division: 'Sylhet',
    districts: [
      { name: 'Sylhet', thanas: ['Sylhet Sadar', 'Beanibazar', 'Golapganj', 'Biswanath', 'Zakiganj', 'Balaganj', 'Fenchuganj', 'Osmani Nagar', 'Companiganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'South Surma'] },
      { name: 'Moulvibazar', thanas: ['Moulvibazar Sadar', 'Sreemangal', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Barlekha', 'Juri'] },
      { name: 'Habiganj', thanas: ['Habiganj Sadar', 'Nabiganj', 'Bahubal', 'Madhabpur', 'Chunarughat', 'Lakhai', 'Baniachong', 'Ajmiriganj', 'Shayestaganj'] },
      { name: 'Sunamganj', thanas: ['Sunamganj Sadar', 'Chhatak', 'Jagannathpur', 'Derai', 'Dharampasha', 'Tahirpur', 'Bishwamvarpur', 'Jamalganj', 'Shantiganj', 'Doarabazar', 'Shulla'] },
    ],
  },
  {
    division: 'Rajshahi',
    districts: [
      { name: 'Rajshahi', thanas: ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Paba', 'Godagari', 'Tanore', 'Mohanpur', 'Bagmara', 'Durgapur', 'Puthia', 'Charghat', 'Bagha'] },
      { name: 'Bogura', thanas: ['Bogura Sadar', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Gabtali', 'Kahalu', 'Nandigram', 'Sonatala', 'Sariakandi', 'Dhunat', 'Adamdighi', 'Dupchanchia'] },
      { name: 'Pabna', thanas: ['Pabna Sadar', 'Ishwardi', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Santhia', 'Sujanagar'] },
      { name: 'Sirajganj', thanas: ['Sirajganj Sadar', 'Kazipur', 'Ullapara', 'Shahjadpur', 'Raiganj', 'Kamarkhanda', 'Tarash', 'Belkuchi', 'Chauhali'] },
      { name: 'Naogaon', thanas: ['Naogaon Sadar', 'Mohadevpur', 'Manda', 'Niamatpur', 'Atrai', 'Raninagar', 'Patnitala', 'Dhamoirhat', 'Sapahar', 'Porsha', 'Badalgachhi'] },
      { name: 'Natore', thanas: ['Natore Sadar', 'Singra', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Bagatipara', 'Naldanga'] },
      { name: 'Chapainawabganj', thanas: ['Chapainawabganj Sadar', 'Shibganj', 'Gomastapur', 'Nachole', 'Bholahat'] },
      { name: 'Joypurhat', thanas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal', 'Akkelpur'] },
    ],
  },
  {
    division: 'Khulna',
    districts: [
      { name: 'Khulna', thanas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada'] },
      { name: 'Jashore', thanas: ['Jashore Sadar', 'Sharsha', 'Jhikargachha', 'Chaugachha', 'Abhaynagar', 'Bagherpara', 'Manirampur', 'Keshabpur'] },
      { name: 'Kushtia', thanas: ['Kushtia Sadar', 'Kumarkhali', 'Khoksa', 'Mirpur', 'Bheramara', 'Daulatpur'] },
      { name: 'Jhenaidah', thanas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa', 'Harinakunda'] },
      { name: 'Satkhira', thanas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'] },
      { name: 'Bagerhat', thanas: ['Bagerhat Sadar', 'Fakirhat', 'Mollahat', 'Kachua', 'Rampal', 'Mongla', 'Morrelganj', 'Sarankhola', 'Chitalmari'] },
      { name: 'Chuadanga', thanas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] },
      { name: 'Meherpur', thanas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] },
      { name: 'Narail', thanas: ['Narail Sadar', 'Lohagara', 'Kalia'] },
      { name: 'Magura', thanas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha'] },
    ],
  },
  {
    division: 'Barishal',
    districts: [
      { name: 'Barishal', thanas: ['Kotwali', 'Airport', 'Kawnia', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Banaripara', 'Gournadi', 'Agailjhara', 'Mehendiganj', 'Muladi', 'Hizla'] },
      { name: 'Patuakhali', thanas: ['Patuakhali Sadar', 'Galachipa', 'Bauphal', 'Dashmina', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali'] },
      { name: 'Bhola', thanas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
      { name: 'Pirojpur', thanas: ['Pirojpur Sadar', 'Bhandaria', 'Mathbaria', 'Kawkhali', 'Nazirpur', 'Nesarabad (Swarupkati)', 'Indurkani'] },
      { name: 'Barguna', thanas: ['Barguna Sadar', 'Amtali', 'Betagi', 'Patharghata', 'Bamna', 'Taltali'] },
      { name: 'Jhalokathi', thanas: ['Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },
    ],
  },
  {
    division: 'Rangpur',
    districts: [
      { name: 'Rangpur', thanas: ['Kotwali', 'Tajhat', 'Haragach', 'Mithapukur', 'Pirganj', 'Badarganj', 'Gangachhara', 'Kaunia', 'Taraganj'] },
      { name: 'Dinajpur', thanas: ['Dinajpur Sadar', 'Birganj', 'Kaharole', 'Birol', 'Bochaganj', 'Phulbari', 'Parbatipur', 'Nawabganj', 'Ghoraghat', 'Hakimpur', 'Chirirbandar', 'Khansama', 'Birampur'] },
      { name: 'Gaibandha', thanas: ['Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Sundarganj', 'Saghata', 'Phulchhari'] },
      { name: 'Kurigram', thanas: ['Kurigram Sadar', 'Nageshwari', 'Bhurungamari', 'Phulbari', 'Rajarhat', 'Ulipur', 'Chilmari', 'Roumari', 'Char Rajibpur'] },
      { name: 'Lalmonirhat', thanas: ['Lalmonirhat Sadar', 'Patgram', 'Hatibandha', 'Kaliganj', 'Aditmari'] },
      { name: 'Nilphamari', thanas: ['Nilphamari Sadar', 'Saidpur', 'Jaldhaka', 'Kishoreganj', 'Domar', 'Dimla'] },
      { name: 'Panchagarh', thanas: ['Panchagarh Sadar', 'Boda', 'Debiganj', 'Atwari', 'Tetulia'] },
      { name: 'Thakurgaon', thanas: ['Thakurgaon Sadar', 'Pirganj', 'Ranisankail', 'Baliadangi', 'Haripur'] },
    ],
  },
  {
    division: 'Mymensingh',
    districts: [
      { name: 'Mymensingh', thanas: ['Kotwali', 'Muktagachha', 'Trishal', 'Bhaluka', 'Phulpur', 'Haluaghat', 'Dhobaura', 'Gafargaon', 'Ishwarganj', 'Nandail', 'Gauripur', 'Tara Khanda'] },
      { name: 'Jamalpur', thanas: ['Jamalpur Sadar', 'Sarishabari', 'Melandaha', 'Islampur', 'Dewanganj', 'Madarganj', 'Bakshiganj'] },
      { name: 'Netrokona', thanas: ['Netrokona Sadar', 'Kendua', 'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Madan', 'Mohanganj', 'Purbadhala', 'Khaliajuri'] },
      { name: 'Sherpur', thanas: ['Sherpur Sadar', 'Nalitabari', 'Nakla', 'Jhenaigati', 'Sreebardi'] },
    ],
  },
];

// Canada Provinces and key cities
export const CANADA_PROVINCES: Subdivision[] = [
  { code: 'ON', name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor'] },
  { code: 'QC', name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'] },
  { code: 'BC', name: 'British Columbia', cities: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford', 'Kelowna', 'Victoria'] },
  { code: 'AB', name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert'] },
  { code: 'MB', name: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'] },
  { code: 'SK', name: 'Saskatchewan', cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw'] },
  { code: 'NS', name: 'Nova Scotia', cities: ['Halifax', 'Dartmouth', 'Sydney', 'Truro'] },
  { code: 'NB', name: 'New Brunswick', cities: ['Moncton', 'Saint John', 'Fredericton'] },
];

// UK Regions and key cities
export const UK_REGIONS: Subdivision[] = [
  { code: 'LDN', name: 'Greater London', cities: ['Central London', 'East London', 'North London', 'South London', 'West London', 'Croydon', 'Barnet', 'Ealing', 'Newham', 'Tower Hamlets'] },
  { code: 'WM', name: 'West Midlands', cities: ['Birmingham', 'Coventry', 'Wolverhampton', 'Solihull', 'Walsall', 'Dudley'] },
  { code: 'GM', name: 'Greater Manchester', cities: ['Manchester', 'Bolton', 'Oldham', 'Rochdale', 'Salford', 'Stockport'] },
  { code: 'WY', name: 'West Yorkshire', cities: ['Leeds', 'Bradford', 'Huddersfield', 'Wakefield', 'Halifax'] },
  { code: 'SCT', name: 'Scotland', cities: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee'] },
  { code: 'WLS', name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport'] },
  { code: 'EM', name: 'East Midlands', cities: ['Leicester', 'Nottingham', 'Derby', 'Northampton'] },
  { code: 'SE', name: 'South East', cities: ['Southampton', 'Portsmouth', 'Brighton', 'Reading', 'Milton Keynes', 'Oxford', 'Luton', 'Slough'] },
];

// Australia States and key cities
export const AUSTRALIA_STATES: Subdivision[] = [
  { code: 'NSW', name: 'New South Wales', cities: ['Sydney', 'Parramatta', 'Blacktown', 'Liverpool', 'Newcastle', 'Wollongong'] },
  { code: 'VIC', name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Dandenong', 'Craigieburn', 'Werribee', 'Ballarat'] },
  { code: 'QLD', name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Logan City', 'Townsville'] },
  { code: 'WA', name: 'Western Australia', cities: ['Perth', 'Mandurah', 'Fremantle', 'Rockingham'] },
  { code: 'SA', name: 'South Australia', cities: ['Adelaide', 'Mount Gambier', 'Whyalla'] },
  { code: 'ACT', name: 'Australian Capital Territory', cities: ['Canberra'] },
];

export function getDialCodeForCountry(countryCode: string): string {
  const match = COUNTRIES.find((c) => c.code === countryCode);
  return match ? match.dialCode : '+1';
}
