import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Users,
  Building,
  MapPin
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"

interface MarketReportProps {
  isOpen: boolean
  onClose: () => void
}

export const MarketReport = ({ isOpen, onClose }: MarketReportProps) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [dataScope, setDataScope] = useState<'regional' | 'national'>('regional')
  const [cityInput, setCityInput] = useState('San Francisco, CA')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [priceTimeframe, setPriceTimeframe] = useState<'1m' | '6m' | '1y' | '5y' | '10y'>('6m')

  // Comprehensive US cities and towns across all states
  const popularCities = [
    // Major Cities
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Indianapolis, IN', 'Charlotte, NC', 'San Francisco, CA', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
    'Nashville, TN', 'Baltimore, MD', 'Louisville, KY', 'Portland, OR', 'Oklahoma City, OK', 'Milwaukee, WI', 'Las Vegas, NV', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA',
    'Sacramento, CA', 'Kansas City, MO', 'Mesa, AZ', 'Atlanta, GA', 'Colorado Springs, CO', 'Raleigh, NC', 'Omaha, NE', 'Miami, FL', 'Oakland, CA', 'Minneapolis, MN',
    'Tulsa, OK', 'Wichita, KS', 'New Orleans, LA', 'Arlington, TX', 'Cleveland, OH', 'Tampa, FL', 'Bakersfield, CA', 'Aurora, CO', 'Anaheim, CA', 'Honolulu, HI',
    'Santa Ana, CA', 'Corpus Christi, TX', 'Riverside, CA', 'Lexington, KY', 'Henderson, NV', 'Stockton, CA', 'Saint Paul, MN', 'Cincinnati, OH', 'St. Louis, MO', 'Pittsburgh, PA',
    
    // Alabama
    'Birmingham, AL', 'Montgomery, AL', 'Mobile, AL', 'Huntsville, AL', 'Tuscaloosa, AL', 'Auburn, AL', 'Dothan, AL', 'Decatur, AL', 'Florence, AL', 'Gadsden, AL',
    'Madison, AL', 'Hoover, AL', 'Vestavia Hills, AL', 'Anniston, AL', 'Bessemer, AL', 'Opelika, AL', 'Phenix City, AL', 'Prattville, AL', 'Troy, AL', 'Enterprise, AL',
    
    // Alaska
    'Anchorage, AK', 'Fairbanks, AK', 'Juneau, AK', 'Sitka, AK', 'Ketchikan, AK', 'Wasilla, AK', 'Kenai, AK', 'Kodiak, AK', 'Bethel, AK', 'Palmer, AK',
    
    // Arizona
    'Phoenix, AZ', 'Tucson, AZ', 'Mesa, AZ', 'Chandler, AZ', 'Scottsdale, AZ', 'Glendale, AZ', 'Gilbert, AZ', 'Tempe, AZ', 'Peoria, AZ', 'Surprise, AZ',
    'Yuma, AZ', 'Avondale, AZ', 'Goodyear, AZ', 'Flagstaff, AZ', 'Buckeye, AZ', 'Lake Havasu City, AZ', 'Casa Grande, AZ', 'Sierra Vista, AZ', 'Maricopa, AZ', 'Oro Valley, AZ',
    
    // Arkansas
    'Little Rock, AR', 'Fort Smith, AR', 'Fayetteville, AR', 'Springdale, AR', 'Jonesboro, AR', 'North Little Rock, AR', 'Conway, AR', 'Rogers, AR', 'Pine Bluff, AR', 'Bentonville, AR',
    'Hot Springs, AR', 'Benton, AR', 'Texarkana, AR', 'Sherwood, AR', 'Jacksonville, AR', 'Russellville, AR', 'Bella Vista, AR', 'Paragould, AR', 'Cabot, AR', 'Searcy, AR',
    
    // California
    'Los Angeles, CA', 'San Diego, CA', 'San Jose, CA', 'San Francisco, CA', 'Fresno, CA', 'Sacramento, CA', 'Long Beach, CA', 'Oakland, CA', 'Bakersfield, CA', 'Anaheim, CA',
    'Santa Ana, CA', 'Riverside, CA', 'Stockton, CA', 'Irvine, CA', 'Chula Vista, CA', 'Fremont, CA', 'San Bernardino, CA', 'Modesto, CA', 'Fontana, CA', 'Oxnard, CA',
    'Moreno Valley, CA', 'Huntington Beach, CA', 'Glendale, CA', 'Santa Clarita, CA', 'Garden Grove, CA', 'Oceanside, CA', 'Rancho Cucamonga, CA', 'Santa Rosa, CA', 'Ontario, CA', 'Lancaster, CA',
    'Elk Grove, CA', 'Corona, CA', 'Palmdale, CA', 'Salinas, CA', 'Pomona, CA', 'Hayward, CA', 'Escondido, CA', 'Torrance, CA', 'Sunnyvale, CA', 'Orange, CA',
    'Fullerton, CA', 'Pasadena, CA', 'Thousand Oaks, CA', 'Visalia, CA', 'Simi Valley, CA', 'Concord, CA', 'Roseville, CA', 'Victorville, CA', 'Santa Clara, CA', 'Vallejo, CA',
    
    // Colorado
    'Denver, CO', 'Colorado Springs, CO', 'Aurora, CO', 'Fort Collins, CO', 'Lakewood, CO', 'Thornton, CO', 'Arvada, CO', 'Westminster, CO', 'Pueblo, CO', 'Centennial, CO',
    'Boulder, CO', 'Greeley, CO', 'Longmont, CO', 'Loveland, CO', 'Grand Junction, CO', 'Broomfield, CO', 'Castle Rock, CO', 'Commerce City, CO', 'Parker, CO', 'Littleton, CO',
    
    // Connecticut
    'Bridgeport, CT', 'New Haven, CT', 'Hartford, CT', 'Stamford, CT', 'Waterbury, CT', 'Norwalk, CT', 'Danbury, CT', 'New Britain, CT', 'West Hartford, CT', 'Greenwich, CT',
    'Hamden, CT', 'Meriden, CT', 'Bristol, CT', 'Manchester, CT', 'West Haven, CT', 'Milford, CT', 'Stratford, CT', 'East Hartford, CT', 'Middletown, CT', 'Wallingford, CT',
    
    // Delaware
    'Wilmington, DE', 'Dover, DE', 'Newark, DE', 'Middletown, DE', 'Smyrna, DE', 'Milford, DE', 'Seaford, DE', 'Georgetown, DE', 'Elsmere, DE', 'New Castle, DE',
    
    // Florida
    'Jacksonville, FL', 'Miami, FL', 'Tampa, FL', 'Orlando, FL', 'St. Petersburg, FL', 'Hialeah, FL', 'Tallahassee, FL', 'Fort Lauderdale, FL', 'Port St. Lucie, FL', 'Cape Coral, FL',
    'Pembroke Pines, FL', 'Hollywood, FL', 'Gainesville, FL', 'Miramar, FL', 'Coral Springs, FL', 'Clearwater, FL', 'Miami Gardens, FL', 'Palm Bay, FL', 'West Palm Beach, FL', 'Pompano Beach, FL',
    'Lakeland, FL', 'Davie, FL', 'Miami Beach, FL', 'Sunrise, FL', 'Boca Raton, FL', 'Deltona, FL', 'Plantation, FL', 'Palm Coast, FL', 'Largo, FL', 'Melbourne, FL',
    
    // Georgia
    'Atlanta, GA', 'Augusta, GA', 'Columbus, GA', 'Macon, GA', 'Savannah, GA', 'Athens, GA', 'Sandy Springs, GA', 'Roswell, GA', 'Johns Creek, GA', 'Albany, GA',
    'Warner Robins, GA', 'Alpharetta, GA', 'Marietta, GA', 'Valdosta, GA', 'Smyrna, GA', 'Dunwoody, GA', 'Rome, GA', 'East Point, GA', 'Peachtree Corners, GA', 'Gainesville, GA',
    
    // Hawaii
    'Honolulu, HI', 'East Honolulu, HI', 'Pearl City, HI', 'Hilo, HI', 'Kailua, HI', 'Waipahu, HI', 'Kaneohe, HI', 'Mililani, HI', 'Kahului, HI', 'Ewa Gentry, HI',
    
    // Idaho
    'Boise, ID', 'Meridian, ID', 'Nampa, ID', 'Idaho Falls, ID', 'Pocatello, ID', 'Caldwell, ID', 'Coeur d\'Alene, ID', 'Twin Falls, ID', 'Lewiston, ID', 'Post Falls, ID',
    
    // Illinois
    'Chicago, IL', 'Aurora, IL', 'Rockford, IL', 'Joliet, IL', 'Naperville, IL', 'Springfield, IL', 'Peoria, IL', 'Elgin, IL', 'Waukegan, IL', 'Cicero, IL',
    'Champaign, IL', 'Bloomington, IL', 'Arlington Heights, IL', 'Evanston, IL', 'Decatur, IL', 'Schaumburg, IL', 'Bolingbrook, IL', 'Palatine, IL', 'Skokie, IL', 'Des Plaines, IL',
    
    // Indiana
    'Indianapolis, IN', 'Fort Wayne, IN', 'Evansville, IN', 'South Bend, IN', 'Carmel, IN', 'Fishers, IN', 'Bloomington, IN', 'Hammond, IN', 'Gary, IN', 'Muncie, IN',
    'Lafayette, IN', 'Terre Haute, IN', 'Kokomo, IN', 'Anderson, IN', 'Noblesville, IN', 'Greenwood, IN', 'Elkhart, IN', 'Mishawaka, IN', 'Lawrence, IN', 'Jeffersonville, IN',
    
    // Iowa
    'Des Moines, IA', 'Cedar Rapids, IA', 'Davenport, IA', 'Sioux City, IA', 'Iowa City, IA', 'Waterloo, IA', 'Council Bluffs, IA', 'Ames, IA', 'West Des Moines, IA', 'Dubuque, IA',
    'Ankeny, IA', 'Urbandale, IA', 'Cedar Falls, IA', 'Marion, IA', 'Bettendorf, IA', 'Mason City, IA', 'Marshalltown, IA', 'Clinton, IA', 'Burlington, IA', 'Ottumwa, IA',
    
    // Kansas
    'Wichita, KS', 'Overland Park, KS', 'Kansas City, KS', 'Topeka, KS', 'Olathe, KS', 'Lawrence, KS', 'Shawnee, KS', 'Manhattan, KS', 'Lenexa, KS', 'Salina, KS',
    'Hutchinson, KS', 'Leavenworth, KS', 'Leawood, KS', 'Dodge City, KS', 'Garden City, KS', 'Emporia, KS', 'Junction City, KS', 'Derby, KS', 'Prairie Village, KS', 'Hays, KS',
    
    // Kentucky
    'Louisville, KY', 'Lexington, KY', 'Bowling Green, KY', 'Owensboro, KY', 'Covington, KY', 'Richmond, KY', 'Georgetown, KY', 'Florence, KY', 'Hopkinsville, KY', 'Nicholasville, KY',
    'Elizabethtown, KY', 'Henderson, KY', 'Frankfort, KY', 'Jeffersontown, KY', 'Independence, KY', 'Paducah, KY', 'Radcliff, KY', 'Ashland, KY', 'Murray, KY', 'Erlanger, KY',
    
    // Louisiana
    'New Orleans, LA', 'Baton Rouge, LA', 'Shreveport, LA', 'Lafayette, LA', 'Lake Charles, LA', 'Kenner, LA', 'Bossier City, LA', 'Monroe, LA', 'Alexandria, LA', 'Houma, LA',
    'Marrero, LA', 'Bayou Cane, LA', 'Prairieville, LA', 'Central, LA', 'Slidell, LA', 'Ruston, LA', 'Hammond, LA', 'Sulphur, LA', 'Thibodaux, LA', 'Natchitoches, LA',
    
    // Maine
    'Portland, ME', 'Lewiston, ME', 'Bangor, ME', 'South Portland, ME', 'Auburn, ME', 'Biddeford, ME', 'Sanford, ME', 'Saco, ME', 'Augusta, ME', 'Westbrook, ME',
    
    // Maryland
    'Baltimore, MD', 'Frederick, MD', 'Rockville, MD', 'Gaithersburg, MD', 'Bowie, MD', 'Hagerstown, MD', 'Annapolis, MD', 'College Park, MD', 'Salisbury, MD', 'Laurel, MD',
    'Greenbelt, MD', 'Cumberland, MD', 'Westminster, MD', 'Hyattsville, MD', 'Takoma Park, MD', 'Easton, MD', 'Glen Burnie, MD', 'Germantown, MD', 'Silver Spring, MD', 'Bethesda, MD',
    
    // Massachusetts
    'Boston, MA', 'Worcester, MA', 'Springfield, MA', 'Lowell, MA', 'Cambridge, MA', 'New Bedford, MA', 'Brockton, MA', 'Quincy, MA', 'Lynn, MA', 'Fall River, MA',
    'Newton, MA', 'Lawrence, MA', 'Somerville, MA', 'Framingham, MA', 'Haverhill, MA', 'Waltham, MA', 'Malden, MA', 'Brookline, MA', 'Plymouth, MA', 'Medford, MA',
    
    // Michigan
    'Detroit, MI', 'Grand Rapids, MI', 'Warren, MI', 'Sterling Heights, MI', 'Lansing, MI', 'Ann Arbor, MI', 'Flint, MI', 'Dearborn, MI', 'Livonia, MI', 'Westland, MI',
    'Troy, MI', 'Farmington Hills, MI', 'Kalamazoo, MI', 'Wyoming, MI', 'Southfield, MI', 'Rochester Hills, MI', 'Taylor, MI', 'Pontiac, MI', 'St. Clair Shores, MI', 'Royal Oak, MI',
    
    // Minnesota
    'Minneapolis, MN', 'St. Paul, MN', 'Rochester, MN', 'Duluth, MN', 'Bloomington, MN', 'Brooklyn Park, MN', 'Plymouth, MN', 'St. Cloud, MN', 'Woodbury, MN', 'Eagan, MN',
    'Burnsville, MN', 'Eden Prairie, MN', 'Coon Rapids, MN', 'Blaine, MN', 'Lakeville, MN', 'Minnetonka, MN', 'Apple Valley, MN', 'Edina, MN', 'St. Louis Park, MN', 'Moorhead, MN',
    
    // Mississippi
    'Jackson, MS', 'Gulfport, MS', 'Southaven, MS', 'Hattiesburg, MS', 'Biloxi, MS', 'Meridian, MS', 'Tupelo, MS', 'Greenville, MS', 'Olive Branch, MS', 'Horn Lake, MS',
    
    // Missouri
    'Kansas City, MO', 'St. Louis, MO', 'Springfield, MO', 'Independence, MO', 'Columbia, MO', 'Lee\'s Summit, MO', 'O\'Fallon, MO', 'St. Joseph, MO', 'St. Charles, MO', 'St. Peters, MO',
    'Blue Springs, MO', 'Florissant, MO', 'Joplin, MO', 'Chesterfield, MO', 'Jefferson City, MO', 'Cape Girardeau, MO', 'Oakville, MO', 'Ballwin, MO', 'Raytown, MO', 'Liberty, MO',
    
    // Montana
    'Billings, MT', 'Missoula, MT', 'Great Falls, MT', 'Bozeman, MT', 'Butte, MT', 'Helena, MT', 'Kalispell, MT', 'Havre, MT', 'Anaconda, MT', 'Miles City, MT',
    
    // Nebraska
    'Omaha, NE', 'Lincoln, NE', 'Bellevue, NE', 'Grand Island, NE', 'Kearney, NE', 'Fremont, NE', 'Hastings, NE', 'North Platte, NE', 'Norfolk, NE', 'Columbus, NE',
    
    // Nevada
    'Las Vegas, NV', 'Henderson, NV', 'Reno, NV', 'North Las Vegas, NV', 'Sparks, NV', 'Carson City, NV', 'Fernley, NV', 'Elko, NV', 'Mesquite, NV', 'Boulder City, NV',
    
    // New Hampshire
    'Manchester, NH', 'Nashua, NH', 'Concord, NH', 'Derry, NH', 'Rochester, NH', 'Salem, NH', 'Dover, NH', 'Merrimack, NH', 'Londonderry, NH', 'Hudson, NH',
    
    // New Jersey
    'Newark, NJ', 'Jersey City, NJ', 'Paterson, NJ', 'Elizabeth, NJ', 'Edison, NJ', 'Woodbridge, NJ', 'Lakewood, NJ', 'Toms River, NJ', 'Hamilton, NJ', 'Trenton, NJ',
    'Clifton, NJ', 'Camden, NJ', 'Brick, NJ', 'East Orange, NJ', 'Bayonne, NJ', 'Vineland, NJ', 'Union City, NJ', 'Passaic, NJ', 'Hoboken, NJ', 'West New York, NJ',
    
    // New Mexico
    'Albuquerque, NM', 'Las Cruces, NM', 'Rio Rancho, NM', 'Santa Fe, NM', 'Roswell, NM', 'Farmington, NM', 'Clovis, NM', 'Hobbs, NM', 'Alamogordo, NM', 'Carlsbad, NM',
    
    // New York
    'New York, NY', 'Buffalo, NY', 'Rochester, NY', 'Yonkers, NY', 'Syracuse, NY', 'Albany, NY', 'New Rochelle, NY', 'Mount Vernon, NY', 'Schenectady, NY', 'Utica, NY',
    'White Plains, NY', 'Hempstead, NY', 'Troy, NY', 'Niagara Falls, NY', 'Binghamton, NY', 'Freeport, NY', 'Valley Stream, NY', 'Long Beach, NY', 'Rome, NY', 'Watertown, NY',
    
    // North Carolina
    'Charlotte, NC', 'Raleigh, NC', 'Greensboro, NC', 'Durham, NC', 'Winston-Salem, NC', 'Fayetteville, NC', 'Cary, NC', 'Wilmington, NC', 'High Point, NC', 'Greenville, NC',
    'Asheville, NC', 'Concord, NC', 'Gastonia, NC', 'Jacksonville, NC', 'Chapel Hill, NC', 'Rocky Mount, NC', 'Burlington, NC', 'Wilson, NC', 'Huntersville, NC', 'Kannapolis, NC',
    
    // North Dakota
    'Fargo, ND', 'Bismarck, ND', 'Grand Forks, ND', 'Minot, ND', 'West Fargo, ND', 'Williston, ND', 'Dickinson, ND', 'Mandan, ND', 'Jamestown, ND', 'Wahpeton, ND',
    
    // Ohio
    'Columbus, OH', 'Cleveland, OH', 'Cincinnati, OH', 'Toledo, OH', 'Akron, OH', 'Dayton, OH', 'Parma, OH', 'Canton, OH', 'Youngstown, OH', 'Lorain, OH',
    'Hamilton, OH', 'Springfield, OH', 'Kettering, OH', 'Elyria, OH', 'Lakewood, OH', 'Cuyahoga Falls, OH', 'Middletown, OH', 'Euclid, OH', 'Newark, OH', 'Mansfield, OH',
    
    // Oklahoma
    'Oklahoma City, OK', 'Tulsa, OK', 'Norman, OK', 'Broken Arrow, OK', 'Lawton, OK', 'Edmond, OK', 'Moore, OK', 'Midwest City, OK', 'Enid, OK', 'Stillwater, OK',
    'Muskogee, OK', 'Bartlesville, OK', 'Owasso, OK', 'Shawnee, OK', 'Ponca City, OK', 'Ardmore, OK', 'Duncan, OK', 'Bixby, OK', 'McAlester, OK', 'Tahlequah, OK',
    
    // Oregon
    'Portland, OR', 'Eugene, OR', 'Salem, OR', 'Gresham, OR', 'Hillsboro, OR', 'Bend, OR', 'Beaverton, OR', 'Medford, OR', 'Springfield, OR', 'Corvallis, OR',
    'Albany, OR', 'Tigard, OR', 'Lake Oswego, OR', 'Keizer, OR', 'Grants Pass, OR', 'Oregon City, OR', 'McMinnville, OR', 'Redmond, OR', 'Tualatin, OR', 'West Linn, OR',
    
    // Pennsylvania
    'Philadelphia, PA', 'Pittsburgh, PA', 'Allentown, PA', 'Erie, PA', 'Reading, PA', 'Scranton, PA', 'Bethlehem, PA', 'Lancaster, PA', 'Harrisburg, PA', 'Altoona, PA',
    'York, PA', 'State College, PA', 'Wilkes-Barre, PA', 'Chester, PA', 'Williamsport, PA', 'Easton, PA', 'Lebanon, PA', 'Hazleton, PA', 'New Castle, PA', 'Johnstown, PA',
    
    // Rhode Island
    'Providence, RI', 'Warwick, RI', 'Cranston, RI', 'Pawtucket, RI', 'East Providence, RI', 'Woonsocket, RI', 'Newport, RI', 'Central Falls, RI', 'Westerly, RI', 'Cumberland, RI',
    
    // South Carolina
    'Charleston, SC', 'Columbia, SC', 'North Charleston, SC', 'Mount Pleasant, SC', 'Rock Hill, SC', 'Greenville, SC', 'Summerville, SC', 'Sumter, SC', 'Goose Creek, SC', 'Hilton Head Island, SC',
    
    // South Dakota
    'Sioux Falls, SD', 'Rapid City, SD', 'Aberdeen, SD', 'Brookings, SD', 'Watertown, SD', 'Mitchell, SD', 'Yankton, SD', 'Pierre, SD', 'Huron, SD', 'Vermillion, SD',
    
    // Tennessee
    'Memphis, TN', 'Nashville, TN', 'Knoxville, TN', 'Chattanooga, TN', 'Clarksville, TN', 'Murfreesboro, TN', 'Franklin, TN', 'Jackson, TN', 'Johnson City, TN', 'Bartlett, TN',
    
    // Texas
    'Houston, TX', 'San Antonio, TX', 'Dallas, TX', 'Austin, TX', 'Fort Worth, TX', 'El Paso, TX', 'Arlington, TX', 'Corpus Christi, TX', 'Plano, TX', 'Laredo, TX',
    'Lubbock, TX', 'Garland, TX', 'Irving, TX', 'Amarillo, TX', 'Grand Prairie, TX', 'Brownsville, TX', 'McKinney, TX', 'Frisco, TX', 'Pasadena, TX', 'Killeen, TX',
    'Mesquite, TX', 'McAllen, TX', 'Carrollton, TX', 'Midland, TX', 'Waco, TX', 'Round Rock, TX', 'Richardson, TX', 'Lewisville, TX', 'College Station, TX', 'Pearland, TX',
    
    // Utah
    'Salt Lake City, UT', 'West Valley City, UT', 'Provo, UT', 'West Jordan, UT', 'Orem, UT', 'Sandy, UT', 'Ogden, UT', 'St. George, UT', 'Layton, UT', 'Taylorsville, UT',
    
    // Vermont
    'Burlington, VT', 'Essex, VT', 'South Burlington, VT', 'Colchester, VT', 'Rutland, VT', 'Montpelier, VT', 'Winooski, VT', 'St. Albans, VT', 'Newport, VT', 'Vergennes, VT',
    
    // Virginia
    'Virginia Beach, VA', 'Norfolk, VA', 'Chesapeake, VA', 'Richmond, VA', 'Newport News, VA', 'Alexandria, VA', 'Hampton, VA', 'Portsmouth, VA', 'Suffolk, VA', 'Roanoke, VA',
    'Lynchburg, VA', 'Harrisonburg, VA', 'Leesburg, VA', 'Charlottesville, VA', 'Danville, VA', 'Blacksburg, VA', 'Manassas, VA', 'Petersburg, VA', 'Bristol, VA', 'Fredericksburg, VA',
    
    // Washington
    'Seattle, WA', 'Spokane, WA', 'Tacoma, WA', 'Vancouver, WA', 'Bellevue, WA', 'Kent, WA', 'Everett, WA', 'Renton, WA', 'Yakima, WA', 'Federal Way, WA',
    'Spokane Valley, WA', 'Bellingham, WA', 'Kennewick, WA', 'Auburn, WA', 'Pasco, WA', 'Marysville, WA', 'Lakewood, WA', 'Redmond, WA', 'Shoreline, WA', 'Richland, WA',
    
    // West Virginia
    'Charleston, WV', 'Huntington, WV', 'Parkersburg, WV', 'Morgantown, WV', 'Wheeling, WV', 'Martinsburg, WV', 'Fairmont, WV', 'Beckley, WV', 'Clarksburg, WV', 'Lewisburg, WV',
    
    // Wisconsin
    'Milwaukee, WI', 'Madison, WI', 'Green Bay, WI', 'Kenosha, WI', 'Racine, WI', 'Appleton, WI', 'Waukesha, WI', 'Oshkosh, WI', 'Eau Claire, WI', 'Janesville, WI',
    'West Allis, WI', 'La Crosse, WI', 'Sheboygan, WI', 'Wauwatosa, WI', 'Fond du Lac, WI', 'New Berlin, WI', 'Wausau, WI', 'Brookfield, WI', 'Greenfield, WI', 'Beloit, WI',
    
    // Wyoming
    'Cheyenne, WY', 'Casper, WY', 'Laramie, WY', 'Gillette, WY', 'Rock Springs, WY', 'Sheridan, WY', 'Green River, WY', 'Evanston, WY', 'Riverton, WY', 'Jackson, WY'
  ]

  const filteredCities = popularCities.filter(city =>
    city.toLowerCase().includes(cityInput.toLowerCase())
  ).slice(0, 12) // Show top 12 suggestions

  // Generate dynamic market data based on city input
  const generateCityData = (cityName: string) => {
    // Simple hash function to generate consistent data for same city
    const hash = cityName.toLowerCase().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const abs = Math.abs(hash);
    const basePrice = 200000 + (abs % 1500000); // Price range 200K - 1.7M
    const priceChange = ((abs % 200) - 100) / 10; // Change range -10% to +10%
    const daysOnMarket = 15 + (abs % 50); // Days range 15-65
    const marketChange = ((abs % 100) - 50) / 5; // Change range -10% to +10%
    const activeListings = 100 + (abs % 2000); // Listings range 100-2100
    const listingsChange = ((abs % 60) - 30) / 3; // Change range -10% to +10%
    const salesVolume = Math.floor(activeListings * 0.7); // Sales volume based on listings
    const salesChange = ((abs % 80) - 40) / 2; // Change range -20% to +20%
    const pricePerSqFt = Math.floor(basePrice / 1000); // Rough calculation
    const sqftChange = ((abs % 120) - 60) / 10; // Change range -6% to +6%
    const inventory = 1.5 + ((abs % 30) / 10); // Inventory range 1.5-4.5 months
    
    let inventoryTrend = 'Balanced Market';
    if (inventory < 2.5) inventoryTrend = 'Seller\'s Market';
    if (inventory < 1.8) inventoryTrend = 'Hot Market';
    if (inventory > 3.5) inventoryTrend = 'Buyer\'s Market';

    return {
      medianPrice: `$${(basePrice / 1000).toFixed(0)}K`,
      priceChange: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
      daysOnMarket: daysOnMarket.toString(),
      marketChange: `${marketChange >= 0 ? '+' : ''}${marketChange.toFixed(1)}%`,
      activeListings: activeListings.toLocaleString(),
      listingsChange: `${listingsChange >= 0 ? '+' : ''}${listingsChange.toFixed(1)}%`,
      salesVolume: salesVolume.toLocaleString(),
      salesChange: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
      interestRate: '6.8%',
      rateChange: '+0.2%',
      pricePerSqFt: `$${pricePerSqFt}`,
      sqftChange: `${sqftChange >= 0 ? '+' : ''}${sqftChange.toFixed(1)}%`,
      inventory: inventory.toFixed(1),
      inventoryTrend
    };
  }

  // Mock data for different timeframes
  const priceData = {
    '1m': {
      data: [
        { period: 'Week 1', avgPrice: 1340000 },
        { period: 'Week 2', avgPrice: 1350000 },
        { period: 'Week 3', avgPrice: 1360000 },
        { period: 'Week 4', avgPrice: 1370000 }
      ],
      change: '+2.2%'
    },
    '6m': {
      data: [
        { period: 'Jan', avgPrice: 1240000 },
        { period: 'Feb', avgPrice: 1270000 },
        { period: 'Mar', avgPrice: 1290000 },
        { period: 'Apr', avgPrice: 1310000 },
        { period: 'May', avgPrice: 1340000 },
        { period: 'Jun', avgPrice: 1370000 }
      ],
      change: '+10.5%'
    },
    '1y': {
      data: [
        { period: 'Q1 2023', avgPrice: 1180000 },
        { period: 'Q2 2023', avgPrice: 1220000 },
        { period: 'Q3 2023', avgPrice: 1260000 },
        { period: 'Q4 2023', avgPrice: 1300000 },
        { period: 'Q1 2024', avgPrice: 1330000 },
        { period: 'Q2 2024', avgPrice: 1370000 }
      ],
      change: '+16.1%'
    },
    '5y': {
      data: [
        { period: '2020', avgPrice: 980000 },
        { period: '2021', avgPrice: 1100000 },
        { period: '2022', avgPrice: 1250000 },
        { period: '2023', avgPrice: 1300000 },
        { period: '2024', avgPrice: 1370000 }
      ],
      change: '+39.8%'
    },
    '10y': {
      data: [
        { period: '2015', avgPrice: 650000 },
        { period: '2016', avgPrice: 690000 },
        { period: '2017', avgPrice: 750000 },
        { period: '2018', avgPrice: 820000 },
        { period: '2019', avgPrice: 890000 },
        { period: '2020', avgPrice: 980000 },
        { period: '2021', avgPrice: 1100000 },
        { period: '2022', avgPrice: 1250000 },
        { period: '2023', avgPrice: 1300000 },
        { period: '2024', avgPrice: 1370000 }
      ],
      change: '+110.8%'
    }
  }

  const nationalPriceData = {
    '1m': {
      data: [
        { period: 'Week 1', avgPrice: 415000 },
        { period: 'Week 2', avgPrice: 418000 },
        { period: 'Week 3', avgPrice: 419000 },
        { period: 'Week 4', avgPrice: 420000 }
      ],
      change: '+1.2%'
    },
    '6m': {
      data: [
        { period: 'Jan', avgPrice: 405000 },
        { period: 'Feb', avgPrice: 408000 },
        { period: 'Mar', avgPrice: 412000 },
        { period: 'Apr', avgPrice: 415000 },
        { period: 'May', avgPrice: 418000 },
        { period: 'Jun', avgPrice: 420000 }
      ],
      change: '+3.7%'
    },
    '1y': {
      data: [
        { period: 'Q1 2023', avgPrice: 385000 },
        { period: 'Q2 2023', avgPrice: 392000 },
        { period: 'Q3 2023', avgPrice: 398000 },
        { period: 'Q4 2023', avgPrice: 405000 },
        { period: 'Q1 2024', avgPrice: 412000 },
        { period: 'Q2 2024', avgPrice: 420000 }
      ],
      change: '+9.1%'
    },
    '5y': {
      data: [
        { period: '2020', avgPrice: 350000 },
        { period: '2021', avgPrice: 375000 },
        { period: '2022', avgPrice: 395000 },
        { period: '2023', avgPrice: 405000 },
        { period: '2024', avgPrice: 420000 }
      ],
      change: '+20.0%'
    },
    '10y': {
      data: [
        { period: '2015', avgPrice: 280000 },
        { period: '2016', avgPrice: 295000 },
        { period: '2017', avgPrice: 310000 },
        { period: '2018', avgPrice: 325000 },
        { period: '2019', avgPrice: 340000 },
        { period: '2020', avgPrice: 350000 },
        { period: '2021', avgPrice: 375000 },
        { period: '2022', avgPrice: 395000 },
        { period: '2023', avgPrice: 405000 },
        { period: '2024', avgPrice: 420000 }
      ],
      change: '+50.0%'
    }
  }

  const currentPriceData = dataScope === 'regional' ? priceData : nationalPriceData

  const inventoryData = [
    { month: 'Jan', listings: 450, sales: 320, inventory: 2.8 },
    { month: 'Feb', listings: 480, sales: 340, inventory: 2.9 },
    { month: 'Mar', listings: 520, sales: 380, inventory: 2.7 },
    { month: 'Apr', listings: 490, sales: 360, inventory: 2.6 },
    { month: 'May', listings: 510, sales: 390, inventory: 2.4 },
    { month: 'Jun', listings: 470, sales: 410, inventory: 2.2 }
  ]

  const marketShareData = [
    { name: 'Single Family', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Condos', value: 25, color: 'hsl(var(--secondary))' },
    { name: 'Townhomes', value: 8, color: 'hsl(var(--accent))' },
    { name: 'Multi-Family', value: 2, color: 'hsl(var(--muted))' }
  ]

  const economicIndicators = dataScope === 'regional' ? [
    { metric: 'Interest Rates', current: '6.8%', change: '+0.2%', trend: 'up' },
    { metric: 'Unemployment', current: '3.2%', change: '-0.1%', trend: 'down' },
    { metric: 'Population Growth', current: '2.1%', change: '+0.3%', trend: 'up' },
    { metric: 'New Construction', current: '1,240', change: '+15%', trend: 'up' }
  ] : [
    { metric: 'Interest Rates', current: '6.9%', change: '+0.3%', trend: 'up' },
    { metric: 'Unemployment', current: '3.7%', change: '+0.1%', trend: 'up' },
    { metric: 'Population Growth', current: '0.8%', change: '+0.1%', trend: 'up' },
    { metric: 'New Construction', current: '1.4M', change: '+8%', trend: 'up' }
  ]

  const marketData = dataScope === 'regional' ? generateCityData(cityInput) : {
    medianPrice: '$420K',
    priceChange: '+3.8%',
    daysOnMarket: '35',
    marketChange: '-8%',
    activeListings: '1.2M',
    listingsChange: '-5%',
    salesVolume: '5.8M',
    salesChange: '+12%',
    interestRate: '6.9%',
    rateChange: '+0.3%',
    pricePerSqFt: '$185',
    sqftChange: '+2.9%',
    inventory: '3.1',
    inventoryTrend: 'Balanced Market'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-2xl">
              <BarChart3 className="h-6 w-6 mr-2 text-primary" />
              Market Analysis Report
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {dataScope === 'regional' && (
                <div className="flex items-center space-x-2 relative">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="relative">
                    <Input
                      placeholder="Enter city name..."
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value)
                        setShowCitySuggestions(true)
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                      className="w-48"
                    />
                    {showCitySuggestions && filteredCities.length > 0 && cityInput.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                        {filteredCities.map((city, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setCityInput(city)
                              setShowCitySuggestions(false)
                            }}
                          >
                            <span className="font-medium">{city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={dataScope === 'regional' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDataScope('regional')}
                  className="text-xs"
                >
                  Regional
                </Button>
                <Button
                  variant={dataScope === 'national' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDataScope('national')}
                  className="text-xs"
                >
                  National
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prices">Price Trends</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="economic">Economic Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Median Price</p>
                      <p className="text-2xl font-bold">{marketData.medianPrice}</p>
                      <Badge variant="secondary" className="bg-success/10 text-success mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {marketData.priceChange}
                      </Badge>
                    </div>
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Days on Market</p>
                      <p className="text-2xl font-bold">{marketData.daysOnMarket}</p>
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive mt-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {marketData.marketChange}
                      </Badge>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Listings</p>
                      <p className="text-2xl font-bold">{marketData.activeListings}</p>
                      <Badge variant="secondary" className="bg-warning/10 text-warning mt-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {marketData.listingsChange}
                      </Badge>
                    </div>
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Volume</p>
                      <p className="text-2xl font-bold">{marketData.salesVolume}</p>
                      <Badge variant="secondary" className="bg-success/10 text-success mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {marketData.salesChange}
                      </Badge>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="shadow-card bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Key Economic Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {economicIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{indicator.metric}</p>
                        <p className="text-lg font-bold">{indicator.current}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${indicator.trend === 'up' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                          }
                        `}
                      >
                        {indicator.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {indicator.change}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prices" className="space-y-6">
            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Average Home Price Trends
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${currentPriceData[priceTimeframe].change.startsWith('+') 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                        }
                      `}
                    >
                      {currentPriceData[priceTimeframe].change.startsWith('+') ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {currentPriceData[priceTimeframe].change} change
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center bg-muted rounded-lg p-1 mt-4">
                  {['1m', '6m', '1y', '5y', '10y'].map((period) => (
                    <Button
                      key={period}
                      variant={priceTimeframe === period ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPriceTimeframe(period as any)}
                      className="text-xs flex-1"
                    >
                      {period === '1m' ? '1 Month' : 
                       period === '6m' ? '6 Months' :
                       period === '1y' ? '1 Year' :
                       period === '5y' ? '5 Years' : '10 Years'}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={currentPriceData[priceTimeframe].data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis 
                      tickFormatter={(value) => 
                        dataScope === 'regional' 
                          ? `$${(value / 1000000).toFixed(1)}M`
                          : `$${(value / 1000).toFixed(0)}K`
                      } 
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `$${value.toLocaleString()}`, 
                        'Average Home Price'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPrice" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Inventory & Sales Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="listings" fill="hsl(var(--primary))" name="New Listings" />
                    <Bar dataKey="sales" fill="hsl(var(--secondary))" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Months of Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} months`, '']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inventory" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="economic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-card bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                    Interest Rate Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">30-Year Fixed</span>
                        <span className="text-2xl font-bold">{dataScope === 'regional' ? '6.8%' : '6.9%'}</span>
                      </div>
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {dataScope === 'regional' ? '+0.2%' : '+0.3%'} from last month
                      </Badge>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">15-Year Fixed</span>
                        <span className="text-2xl font-bold">{dataScope === 'regional' ? '6.1%' : '6.2%'}</span>
                      </div>
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {dataScope === 'regional' ? '+0.1%' : '+0.2%'} from last month
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Demographics & Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Population Growth</span>
                      <div className="text-right">
                        <span className="font-semibold">{dataScope === 'regional' ? '2.1%' : '0.8%'}</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {dataScope === 'regional' ? 'Strong' : 'Moderate'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Job Growth</span>
                      <div className="text-right">
                        <span className="font-semibold">{dataScope === 'regional' ? '3.4%' : '2.1%'}</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {dataScope === 'regional' ? 'Excellent' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Median Income</span>
                      <div className="text-right">
                        <span className="font-semibold">{dataScope === 'regional' ? '$89,500' : '$70,200'}</span>
                        <Badge variant="secondary" className="bg-success/10 text-success ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {dataScope === 'regional' ? '+4.2%' : '+3.1%'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}