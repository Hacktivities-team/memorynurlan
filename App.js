import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Utensils, 
  Hospital, 
  FileText, 
  Bus, 
  MessageSquare, 
  Shield,
  Globe,
  TrendingUp,
  Star,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Info,
  Clock,
  Phone,
  Mail
} from "lucide-react";
import "@/App.css";

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tourism-theme');
    return saved || 'dark';  // Default dark mode
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('tourism-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("TR");
  const [statistics, setStatistics] = useState([]);
  const [places, setPlaces] = useState([]);
  const [food, setFood] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speakingPhrase, setSpeakingPhrase] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [countriesRes, statsRes] = await Promise.all([
          axios.get(`${API}/countries`),
          axios.get(`${API}/statistics`)
        ]);
        setCountries(countriesRes.data);
        setStatistics(statsRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch country-specific data
  useEffect(() => {
    const fetchCountryData = async () => {
      if (!selectedCountry) return;
      
      setLoading(true);
      try {
        const [placesRes, foodRes, hospitalsRes, languagesRes] = await Promise.all([
          axios.get(`${API}/places/${selectedCountry}`),
          axios.get(`${API}/food/${selectedCountry}`),
          axios.get(`${API}/hospitals/${selectedCountry}`),
          axios.get(`${API}/language/${selectedCountry}`)
        ]);
        
        setPlaces(placesRes.data);
        setFood(foodRes.data);
        setHospitals(hospitalsRes.data);
        setLanguages(languagesRes.data);
      } catch (error) {
        console.error("Error fetching country data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCountryData();
  }, [selectedCountry]);

  const selectedCountryInfo = countries.find(c => c.code === selectedCountry);

  // Speech synthesis for pronunciation
  const speakPhrase = (text, lang = 'en-US') => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    // Set language based on country
    const languages = {
      'TR': 'tr-TR',
      'GE': 'ka-GE',
      'RU': 'ru-RU', 
      'AE': 'ar-SA'
    };
    
    utterance.lang = languages[selectedCountry] || 'en-US';
    
    utterance.onstart = () => setSpeakingPhrase(text);
    utterance.onend = () => setSpeakingPhrase(null);
    utterance.onerror = () => setSpeakingPhrase(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const StatisticsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statistics.map((stat) => (
        <Card key={stat.id} className="stats-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <Badge variant="secondary" className="stat-badge font-bold">
                {stat.percentage}%
              </Badge>
            </div>
            <h3 className="font-bold text-foreground mb-2 text-sm leading-tight">{stat.title}</h3>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const PlacesSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place) => (
        <Card key={place.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-testid={`place-card-${place.id}`}>
          <div className="relative">
            <img 
              src={place.image_url} 
              alt={place.name}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-emerald-500 text-white flex items-center gap-1">
                <Star className="w-3 h-3" />
                {place.rating}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">{place.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{place.description}</p>
            <div className="flex justify-between items-center">
              <Badge variant="outline">{place.city}</Badge>
              <Badge className="bg-blue-100 text-blue-800">{place.category}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const FoodSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {food.map((item) => (
        <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-testid={`food-card-${item.id}`}>
          <div className="relative">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {item.ingredients.map((ingredient, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">{ingredient}</Badge>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <Badge className="bg-green-500 text-white">{item.average_price}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const HospitalsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {hospitals.map((hospital) => (
        <Card key={hospital.id} className="shadow-lg hover:shadow-xl transition-all duration-300" data-testid={`hospital-card-${hospital.id}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hospital className="w-5 h-5 text-red-600" />
              {hospital.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-gray-700">Ünvan:</p>
              <p className="text-gray-600">{hospital.address}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700">Telefon:</p>
              <p className="text-gray-600">{hospital.phone}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700">Təcili:</p>
              <Badge className="bg-red-500 text-white font-bold">{hospital.emergency_phone}</Badge>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700 mb-2">Xidmətlər:</p>
              <div className="flex flex-wrap gap-2">
                {hospital.services.map((service, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{service}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const LanguageSection = () => {
    const categories = [...new Set(languages.map(l => l.category))];
    
    return (
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-xl font-bold mb-4 capitalize text-foreground">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages
                .filter(l => l.category === category)
                .map((phrase) => (
                  <Card key={phrase.id} className="language-card shadow-md hover:shadow-lg transition-all duration-300" data-testid={`phrase-card-${phrase.id}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-foreground">{phrase.azerbaijani}</span>
                          <Badge variant="secondary" className="text-xs">{category}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-lg font-bold text-primary">{phrase.local_language}</div>
                            <div className="text-sm text-muted-foreground italic">/{phrase.pronunciation}/</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakPhrase(phrase.local_language)}
                            className="ml-2 p-2 hover:bg-primary/10 shrink-0"
                            data-testid={`speak-btn-${phrase.id}`}
                          >
                            {speakingPhrase === phrase.local_language ? (
                              <VolumeX className="w-4 h-4 text-primary animate-pulse" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-primary" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getTabIcon = (tab) => {
    const icons = {
      overview: Globe,
      places: MapPin,
      food: Utensils,
      hospitals: Hospital,
      visa: FileText,
      transport: Bus,
      language: MessageSquare,
      safety: Shield
    };
    const Icon = icons[tab] || Globe;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="header-bg shadow-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 logo-bg rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold logo-text">
                Turizm Helper
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
                data-testid="theme-toggle"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
              </Button>
              
              {/* Country Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Ölkə:</span>
                <div className="flex space-x-2" data-testid="country-selector">
                  {countries.map((country) => (
                    <Button
                      key={country.code}
                      variant={selectedCountry === country.code ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCountry(country.code)}
                      className="country-btn transition-all duration-200"
                      data-testid={`country-btn-${country.code}`}
                    >
                      <span className="mr-2">{country.flag_emoji}</span>
                      {country.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Statistics Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Azərbaycan Turistlərinin Statistikası
          </h2>
          <StatisticsSection />
        </section>

        {/* Country Information Tabs */}
        {selectedCountryInfo && (
          <section>
            <div className="main-card rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl">{selectedCountryInfo.flag_emoji}</span>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{selectedCountryInfo.name}</h2>
                  <p className="text-muted-foreground">Paytaxt: {selectedCountryInfo.capital} • Dil: {selectedCountryInfo.language} • Valyuta: {selectedCountryInfo.currency}</p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="tabs-list grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 rounded-xl">
                  <TabsTrigger value="overview" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-overview">
                    {getTabIcon("overview")}
                    <span className="hidden sm:inline">Ümumi</span>
                  </TabsTrigger>
                  <TabsTrigger value="places" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-places">
                    {getTabIcon("places")}
                    <span className="hidden sm:inline">Yerlər</span>
                  </TabsTrigger>
                  <TabsTrigger value="food" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-food">
                    {getTabIcon("food")}
                    <span className="hidden sm:inline">Yeməklər</span>
                  </TabsTrigger>
                  <TabsTrigger value="hospitals" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-hospitals">
                    {getTabIcon("hospitals")}
                    <span className="hidden sm:inline">Xəstəxanalar</span>
                  </TabsTrigger>
                  <TabsTrigger value="visa" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-visa">
                    {getTabIcon("visa")}
                    <span className="hidden sm:inline">Viza</span>
                  </TabsTrigger>
                  <TabsTrigger value="transport" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-transport">
                    {getTabIcon("transport")}
                    <span className="hidden sm:inline">Nəqliyyat</span>
                  </TabsTrigger>
                  <TabsTrigger value="language" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-language">
                    {getTabIcon("language")}
                    <span className="hidden sm:inline">Dil</span>
                  </TabsTrigger>
                  <TabsTrigger value="safety" className="tab-trigger flex items-center gap-2 px-3 py-2 text-xs rounded-lg" data-testid="tab-safety">
                    {getTabIcon("safety")}
                    <span className="hidden sm:inline">Təhlükəsizlik</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                  <TabsContent value="overview" className="space-y-6">
                    <div className="text-center py-12">
                      <h3 className="text-2xl font-bold text-foreground mb-6">
                        {selectedCountryInfo.name} haqqında ümumi məlumat
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="info-card p-6 rounded-xl">
                          <Info className="w-8 h-8 text-primary mb-3 mx-auto" />
                          <h4 className="font-bold text-foreground mb-2">Ümumi Məlumat</h4>
                          <p className="text-sm text-muted-foreground">Ölkə haqqında əsas faktlar və məlumatlar</p>
                        </div>
                        <div className="info-card p-6 rounded-xl">
                          <Clock className="w-8 h-8 text-primary mb-3 mx-auto" />
                          <h4 className="font-bold text-foreground mb-2">Vaxt Zonası</h4>
                          <p className="text-sm text-muted-foreground">Yerli vaxt və fərq</p>
                        </div>
                        <div className="info-card p-6 rounded-xl">
                          <Phone className="w-8 h-8 text-primary mb-3 mx-auto" />
                          <h4 className="font-bold text-foreground mb-2">Təcili Nömrələr</h4>
                          <p className="text-sm text-muted-foreground">Vacib telefon nömrələri</p>
                        </div>
                        <div className="info-card p-6 rounded-xl">
                          <Mail className="w-8 h-8 text-primary mb-3 mx-auto" />
                          <h4 className="font-bold text-foreground mb-2">Səfirlik</h4>
                          <p className="text-sm text-muted-foreground">Azərbaycan səfirliyi əlaqə</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground max-w-2xl mx-auto mt-6">
                        Bu səhifədə {selectedCountryInfo.name} ölkəsi haqqında səyahət üçün lazım olan bütün məlumatları tapa bilərsiniz. 
                        Yuxarıdakı tablardan istədiyiniz kateqoriyanı seçə bilərsiniz.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="places">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : (
                      <PlacesSection />
                    )}
                  </TabsContent>

                  <TabsContent value="food">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : (
                      <FoodSection />
                    )}
                  </TabsContent>

                  <TabsContent value="hospitals">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : (
                      <HospitalsSection />
                    )}
                  </TabsContent>

                  <TabsContent value="visa">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-foreground mb-6">Viza və Sərhəd Məlumatları</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Viza Requirements */}
                        <Card className="main-card p-6">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" />
                              Viza Tələbləri
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedCountry === 'TR' && (
                              <>
                                <p className="text-muted-foreground"><strong>Tələb olunur:</strong> Xeyr (90 günədək)</p>
                                <p className="text-muted-foreground"><strong>Pasport müddəti:</strong> Ən azı 60 gün qalmalıdır</p>
                                <p className="text-muted-foreground"><strong>Gömrük:</strong> 200 siqaret, 1L spirt</p>
                              </>
                            )}
                            {selectedCountry === 'GE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Tələb olunur:</strong> Xeyr (90 günədək)</p>
                                <p className="text-muted-foreground"><strong>Pasport müddəti:</strong> Ən azı 3 ay qalmalıdır</p>
                                <p className="text-muted-foreground"><strong>Gömrük:</strong> 400 siqaret, 4L şərab</p>
                              </>
                            )}
                            {selectedCountry === 'RU' && (
                              <>
                                <p className="text-muted-foreground"><strong>Tələb olunur:</strong> Bəli</p>
                                <p className="text-muted-foreground"><strong>Müddət:</strong> 14-30 gün</p>
                                <p className="text-muted-foreground"><strong>Qiymət:</strong> 35-105 USD</p>
                                <p className="text-muted-foreground"><strong>Sənədlər:</strong> Pasport, foto, dəvətnamə</p>
                              </>
                            )}
                            {selectedCountry === 'AE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Tələb olunur:</strong> Xeyr (30 günədək)</p>
                                <p className="text-muted-foreground"><strong>Pasport müddəti:</strong> Ən azı 6 ay qalmalıdır</p>
                                <p className="text-muted-foreground"><strong>Gömrük:</strong> 400 siqaret, 4L spirt</p>
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Entry Process */}
                        <Card className="main-card p-6">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-primary" />
                              Giriş Prosesi
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground">1. Sərhəddə</h4>
                              <p className="text-sm text-muted-foreground">Pasport və bilet təqdim edin</p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground">2. Gömrük</h4>
                              <p className="text-sm text-muted-foreground">Bəyan formasını doldurun</p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground">3. Çıxış</h4>
                              <p className="text-sm text-muted-foreground">Sərhəd nəzarətindən keçin</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Important Documents */}
                      <Card className="main-card p-6">
                        <CardHeader>
                          <CardTitle>Lazımi Sənədlər</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="info-card p-4 rounded-lg">
                              <h4 className="font-bold text-foreground mb-2">Pasport</h4>
                              <p className="text-sm text-muted-foreground">Etibarlı beynəlxalq pasport</p>
                            </div>
                            <div className="info-card p-4 rounded-lg">
                              <h4 className="font-bold text-foreground mb-2">Bilet</h4>
                              <p className="text-sm text-muted-foreground">Geri dönüş bileti</p>
                            </div>
                            <div className="info-card p-4 rounded-lg">
                              <h4 className="font-bold text-foreground mb-2">Sığorta</h4>
                              <p className="text-sm text-muted-foreground">Səyahət sığortası (tövsiyə)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tips */}
                      <Card className="main-card p-6">
                        <CardHeader>
                          <CardTitle>Məsləhətlər</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Badge className="bg-green-500 text-white">İpucu</Badge>
                            <p className="text-muted-foreground">Sərhəd keçidi üçün əlavə vaxt ayırın</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <Badge className="bg-blue-500 text-white">Məsləhət</Badge>
                            <p className="text-muted-foreground">Bütün sənədlərin surətini çıxarın</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <Badge className="bg-orange-500 text-white">Diqqət</Badge>
                            <p className="text-muted-foreground">Qadağan olunmuş əşyaları aparmayin</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="transport">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-foreground mb-6">Nəqliyyat Məlumatları</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Public Transport */}
                        <Card className="main-card p-6">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <Bus className="w-5 h-5 text-primary" />
                              İctimai Nəqliyyat
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedCountry === 'TR' && (
                              <>
                                <p className="text-muted-foreground"><strong>Metro:</strong> 4-15 TL</p>
                                <p className="text-muted-foreground"><strong>Avtobus:</strong> 3-8 TL</p>
                                <p className="text-muted-foreground"><strong>Dolmuş:</strong> 2-5 TL</p>
                                <p className="text-muted-foreground"><strong>Kart:</strong> İstanbulkart</p>
                              </>
                            )}
                            {selectedCountry === 'GE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Metro:</strong> 1 Lari</p>
                                <p className="text-muted-foreground"><strong>Avtobus:</strong> 1 Lari</p>
                                <p className="text-muted-foreground"><strong>Marshrutka:</strong> 1-2 Lari</p>
                                <p className="text-muted-foreground"><strong>Kart:</strong> Ertguli kart</p>
                              </>
                            )}
                            {selectedCountry === 'RU' && (
                              <>
                                <p className="text-muted-foreground"><strong>Metro:</strong> 60 Rubl</p>
                                <p className="text-muted-foreground"><strong>Avtobus:</strong> 40 Rubl</p>
                                <p className="text-muted-foreground"><strong>Tramvay:</strong> 40 Rubl</p>
                                <p className="text-muted-foreground"><strong>Kart:</strong> Troyka kart</p>
                              </>
                            )}
                            {selectedCountry === 'AE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Metro:</strong> 3-8 AED</p>
                                <p className="text-muted-foreground"><strong>Avtobus:</strong> 2-5 AED</p>
                                <p className="text-muted-foreground"><strong>Tramvay:</strong> 3 AED</p>
                                <p className="text-muted-foreground"><strong>Kart:</strong> Nol kart</p>
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Taxi Services */}
                        <Card className="main-card p-6">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              Taksi Xidmətləri
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedCountry === 'TR' && (
                              <>
                                <p className="text-muted-foreground"><strong>BiTaksi:</strong> Populyar tətbiq</p>
                                <p className="text-muted-foreground"><strong>Uber:</strong> Böyük şəhərlərdə</p>
                                <p className="text-muted-foreground"><strong>Başlanğıc:</strong> 5-8 TL</p>
                                <p className="text-muted-foreground"><strong>Km:</strong> 2-4 TL</p>
                              </>
                            )}
                            {selectedCountry === 'GE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Bolt:</strong> Əsas tətbiq</p>
                                <p className="text-muted-foreground"><strong>Yandex:</strong> Tbilisidə</p>
                                <p className="text-muted-foreground"><strong>Başlanğıc:</strong> 2-3 Lari</p>
                                <p className="text-muted-foreground"><strong>Km:</strong> 0.8-1.2 Lari</p>
                              </>
                            )}
                            {selectedCountry === 'RU' && (
                              <>
                                <p className="text-muted-foreground"><strong>Yandex:</strong> Əsas tətbiq</p>
                                <p className="text-muted-foreground"><strong>Uber:</strong> Böyük şəhərlərdə</p>
                                <p className="text-muted-foreground"><strong>Başlanğıc:</strong> 100-150 Rubl</p>
                                <p className="text-muted-foreground"><strong>Km:</strong> 20-30 Rubl</p>
                              </>
                            )}
                            {selectedCountry === 'AE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Uber:</strong> Geniş şəbəkə</p>
                                <p className="text-muted-foreground"><strong>Careem:</strong> Yerli tətbiq</p>
                                <p className="text-muted-foreground"><strong>Başlanğıc:</strong> 12-15 AED</p>
                                <p className="text-muted-foreground"><strong>Km:</strong> 2-3 AED</p>
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Airport Transfer */}
                        <Card className="main-card p-6">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <Bus className="w-5 h-5 text-primary" />
                              Hava Limanı
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedCountry === 'TR' && (
                              <>
                                <p className="text-muted-foreground"><strong>Havaist:</strong> Hava limanı avtobusu</p>
                                <p className="text-muted-foreground"><strong>Metro:</strong> Sabiha Gökçən</p>
                                <p className="text-muted-foreground"><strong>Taksi:</strong> 150-300 TL</p>
                                <p className="text-muted-foreground"><strong>Avtobus:</strong> 20-35 TL</p>
                              </>
                            )}
                            {selectedCountry === 'GE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Avtobus 37:</strong> Şəhər mərkəzi</p>
                                <p className="text-muted-foreground"><strong>Taksi:</strong> 30-50 Lari</p>
                                <p className="text-muted-foreground"><strong>Transfer:</strong> 15-25 Lari</p>
                                <p className="text-muted-foreground"><strong>Avtobus:</strong> 1 Lari</p>
                              </>
                            )}
                            {selectedCountry === 'RU' && (
                              <>
                                <p className="text-muted-foreground"><strong>Aeroexpress:</strong> Sürətli qatar</p>
                                <p className="text-muted-foreground"><strong>Metro:</strong> Müxtəlif xətlər</p>
                                <p className="text-muted-foreground"><strong>Taksi:</strong> 1500-3000 Rubl</p>
                                <p className="text-muted-foreground"><strong>Qatar:</strong> 500-700 Rubl</p>
                              </>
                            )}
                            {selectedCountry === 'AE' && (
                              <>
                                <p className="text-muted-foreground"><strong>Metro:</strong> Qırmızı xətt</p>
                                <p className="text-muted-foreground"><strong>Avtobus:</strong> E100, E101</p>
                                <p className="text-muted-foreground"><strong>Taksi:</strong> 80-120 AED</p>
                                <p className="text-muted-foreground"><strong>Metro:</strong> 8-15 AED</p>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Transport Tips */}
                      <Card className="main-card p-6">
                        <CardHeader>
                          <CardTitle>Nəqliyyat Məsləhətləri</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge className="bg-green-500 text-white">İpucu</Badge>
                                <p className="text-muted-foreground">Nəqliyyat kartları daha ucuzdur</p>
                              </div>
                              <div className="flex items-start gap-3">
                                <Badge className="bg-blue-500 text-white">Məsləhət</Badge>
                                <p className="text-muted-foreground">Saat 7-9 və 17-19 sıxlıq olur</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge className="bg-orange-500 text-white">Diqqət</Badge>
                                <p className="text-muted-foreground">Gecə nəqliyyatı məhduddur</p>
                              </div>
                              <div className="flex items-start gap-3">
                                <Badge className="bg-purple-500 text-white">Qeyd</Badge>
                                <p className="text-muted-foreground">Taksi tətbiqlər daha təhlükəsizdir</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="language">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : (
                      <LanguageSection />
                    )}
                  </TabsContent>

                  <TabsContent value="safety">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-foreground mb-6">Təhlükəsizlik və Qanunlar</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Emergency Numbers */}
                        <Card className="main-card p-6">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <Phone className="w-5 h-5 text-red-600" />
                              Təcili Nömrələr
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedCountry === 'TR' && (
                              <>
                                <div className="flex justify-between"><span>Polis:</span><Badge className="bg-red-500 text-white">155</Badge></div>
                                <div className="flex justify-between"><span>Yanğın:</span><Badge className="bg-red-500 text-white">110</Badge></div>
                                <div className="flex justify-between"><span>Təcili tibbi:</span><Badge className="bg-red-500 text-white">112</Badge></div>
                                <div className="flex justify-between"><span>Turist polis:</span><Badge className="bg-blue-500 text-white">153</Badge></div>
                              </>
                            )}
                            {selectedCountry === 'GE' && (
                              <>
                                <div className="flex justify-between"><span>Bütün təcili:</span><Badge className="bg-red-500 text-white">112</Badge></div>
                                <div className="flex justify-between"><span>Polis:</span><Badge className="bg-red-500 text-white">122</Badge></div>
                                <div className="flex justify-between"><span>Yanğın:</span><Badge className="bg-red-500 text-white">111</Badge></div>
                                <div className="flex justify-between"><span>Tibbi:</span><Badge className="bg-red-500 text-white">113</Badge></div>
                              </>
                            )}
                            {selectedCountry === 'RU' && (
                              <>
                                <div className="flex justify-between"><span>Polis:</span><Badge className="bg-red-500 text-white">102</Badge></div>
                                <div className="flex justify-between"><span>Yanğın:</span><Badge className="bg-red-500 text-white">101</Badge></div>
                                <div className="flex justify-between"><span>Təcili tibbi:</span><Badge className="bg-red-500 text-white">103</Badge></div>
                                <div className="flex justify-between"><span>Birləşmiş:</span><Badge className="bg-red-500 text-white">112</Badge></div>
                              </>
                            )}
                            {selectedCountry === 'AE' && (
                              <>
                                <div className="flex justify-between"><span>Polis:</span><Badge className="bg-red-500 text-white">999</Badge></div>
                                <div className="flex justify-between"><span>Yanğın:</span><Badge className="bg-red-500 text-white">997</Badge></div>
                                <div className="flex justify-between"><span>Təcili tibbi:</span><Badge className="bg-red-500 text-white">998</Badge></div>
                                <div className="flex justify-between"><span>Turist yardım:</span><Badge className="bg-blue-500 text-white">800 4488</Badge></div>
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Local Laws */}
                        <Card className="main-card p-6">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-primary" />
                              Yerli Qanunlar
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedCountry === 'TR' && (
                              <>
                                <p className="text-muted-foreground">• Ictimai yerlərdə siqaret içmək qadağandır</p>
                                <p className="text-muted-foreground">• Məscidlərdə uyğun geyim vacibdir</p>
                                <p className="text-muted-foreground">• Narkotik maddələr qəti qadağandır</p>
                                <p className="text-muted-foreground">• Polis sənəd yoxlaması aparır</p>
                              </>
                            )}
                            {selectedCountry === 'GE' && (
                              <>
                                <p className="text-muted-foreground">• Sürət həddlərinə riayət edin</p>
                                <p className="text-muted-foreground">• İctimai yerlərdə alkoqol qadağandır</p>
                                <p className="text-muted-foreground">• Kilsələrdə sakit olun</p>
                                <p className="text-muted-foreground">• Dağlıq bölgələrdə ehtiyatlı olun</p>
                              </>
                            )}
                            {selectedCountry === 'RU' && (
                              <>
                                <p className="text-muted-foreground">• Registrasiya qaydalarına riayət edin</p>
                                <p className="text-muted-foreground">• İctimai nümayişlər qadağandır</p>
                                <p className="text-muted-foreground">• Metro-da fotoşəkil çəkmək məhduddur</p>
                                <p className="text-muted-foreground">• Hərmətli qanuna riayət vacibdir</p>
                              </>
                            )}
                            {selectedCountry === 'AE' && (
                              <>
                                <p className="text-muted-foreground">• İslami qaydalar çox vacibdir</p>
                                <p className="text-muted-foreground">• İctimai yerlərdə alkoqol qadağandır</p>
                                <p className="text-muted-foreground">• Uyğun geyim tələb olunur</p>
                                <p className="text-muted-foreground">• PDA ictimai yerlərdə qadağandır</p>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Safety Tips */}
                      <Card className="main-card p-6">
                        <CardHeader>
                          <CardTitle>Təhlükəsizlik Məsləhətləri</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="info-card p-4 rounded-lg">
                              <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-500" />
                                Şəxsi Təhlükəsizlik
                              </h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Sənədlərin surətini saxlayın</li>
                                <li>• Qiymətli əşyaları göstərməyin</li>
                                <li>• Gecə saatlarında ehtiyatlı olun</li>
                                <li>• Tanımadığınız yerlərdə tək getməyin</li>
                              </ul>
                            </div>
                            <div className="info-card p-4 rounded-lg">
                              <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-500" />
                                Rabitə
                              </h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Səfirlik nömrələrini saxlayın</li>
                                <li>• Yerli sim kart alın</li>
                                <li>• WiFi parollarını yaddaşa alın</li>
                                <li>• Təcili əlaqə siyahısı hazırlayın</li>
                              </ul>
                            </div>
                            <div className="info-card p-4 rounded-lg">
                              <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                Yolgetirmə
                              </h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Oflayn xəritələr yükləyin</li>
                                <li>• Otelin ünvanını yazdırın</li>
                                <li>• Məşhur yerləri yadda saxlayın</li>
                                <li>• GPS-i həmişə açıq saxlayın</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Common Scams */}
                      <Card className="main-card p-6 border-l-4 border-red-500">
                        <CardHeader>
                          <CardTitle className="text-red-600">Diqqət: Ümumi Fırıldaqlar</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Taksi Fırıldaqları</h4>
                              <p className="text-sm text-muted-foreground">Saymaq təyin etməyən, artıq yol gedən</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Pul Dəyişmə</h4>
                              <p className="text-sm text-muted-foreground">Səhv məzənnə, saxta pullar</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Restoran</h4>
                              <p className="text-sm text-muted-foreground">Gizli xidmət haqqı, artıq hesab</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Yol Yardımı</h4>
                              <p className="text-sm text-muted-foreground">Saxta köməkçilər, yanlış istiqamət</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;