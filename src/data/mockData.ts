import { SpokenWordContent, DonationTier, TeamMember } from '../types';

export const mockSpokenWordContent: SpokenWordContent[] = [
  {
    id: '1',
    title: {
      en: 'Walking in Divine Purpose',
      yo: 'Ririn Ni Idi Ọlọrun',
      ig: 'Ije Na Ebumnuche Chineke',
      ha: 'Tafiya A Manufar Allah'
    },
    description: {
      en: 'Discover God\'s unique plan for your life and step into your destiny',
      yo: 'Ṣe awari ero pataki Ọlọrun fun aye rẹ ki o si wọle si ayanmọ rẹ',
      ig: 'Chọpụta atụmatụ pụrụ iche nke Chineke maka ndụ gị wee banye n\'ọdịnihu gị',
      ha: 'Gano shirin Allah na musamman don rayuwarku kuma ku shiga cikin makomar ku'
    },
    audioUrl: 'https://example.com/audio/purpose-en.mp3',
    duration: '15:32',
    language: 'en',
    theme: 'purpose',
    scriptureRef: 'Jeremiah 29:11',
    transcript: {
      en: 'For I know the plans I have for you, declares the Lord...',
      yo: 'Nitori mo mọ awọn ero ti mo ni fun yin, ni Oluwa wi...',
      ig: 'N\'ihi na m maara atụmatụ m nwere n\'ebe ị nọ, ka Onyenwe anyị kwuru...',
      ha: 'Domin na san shirye-shiryena da nake da su a gare ku, in ji Ubangiji...'
    },
    date: '2024-01-15'
  },
  {
    id: '2',
    title: {
      en: 'Healing for the Broken Heart',
      yo: 'Iwosan Fun Ọkan Ti O Fọ',
      ig: 'Ọgwụgwọ Maka Obi Gbawara Agbawa',
      ha: 'Warkarwa Don Zuciyar Da Ta Karye'
    },
    description: {
      en: 'God\'s comfort and restoration for those experiencing pain and loss',
      yo: 'Itunu ati imupadabọ Ọlọrun fun awọn ti o ni iriri irora ati ipadanu',
      ig: 'Nkasiobi na mweghachi nke Chineke maka ndị na-enwe mgbu na mfu',
      ha: 'Ta\'aziyyar Allah da maido don wadanda suke fuskantar zafi da hasara'
    },
    audioUrl: 'https://example.com/audio/healing-yo.mp3',
    duration: '18:45',
    language: 'yo',
    theme: 'healing',
    scriptureRef: 'Psalm 34:18',
    transcript: {
      en: 'The Lord is close to the brokenhearted...',
      yo: 'Oluwa wa nitosi awọn ọlọkan fifọ...',
      ig: 'Onyenwe anyị nọ nso ndị obi ha gbawara...',
      ha: 'Ubangiji yana kusa da masu karye zuciya...'
    },
    date: '2024-01-10'
  },
  {
    id: '3',
    title: {
      en: 'Victory Over Fear',
      yo: 'Iṣẹgun Lori Ẹru',
      ig: 'Mmeri N\'elu Egwu',
      ha: 'Nasara Akan Tsoro'
    },
    description: {
      en: 'Breaking free from the chains of fear and anxiety through faith',
      yo: 'Tusilẹ lati ẹwọn ẹru ati aibalẹ nipasẹ igbagbọ',
      ig: 'Ịgbapụ n\'agbụ nke egwu na nchegbu site n\'okwukwe',
      ha: 'Warware daga sarƙoƙin tsoro da damuwa ta hanyar bangaskiya'
    },
    audioUrl: 'https://example.com/audio/victory-ig.mp3',
    duration: '12:20',
    language: 'ig',
    theme: 'victory',
    scriptureRef: '2 Timothy 1:7',
    transcript: {
      en: 'For God has not given us a spirit of fear...',
      yo: 'Nitori Ọlọrun ko fun wa ni ẹmi ẹru...',
      ig: 'N\'ihi na Chineke enyeghị anyị mmụọ nke egwu...',
      ha: 'Domin Allah bai ba mu ruhun tsoro ba...'
    },
    date: '2024-01-05'
  }
];

export const donationTiers: DonationTier[] = [
  {
    amount: 25,
    title: {
      en: 'Voice Supporter',
      yo: 'Alátilẹyìn Ohùn',
      ig: 'Onye Nkwado Olu',
      ha: 'Mai Tallafin Murya'
    },
    description: {
      en: 'Help us create one new spoken word piece monthly',
      yo: 'Ran wa lọwọ lati ṣe ọrọ tuntun kan ti a sọ loṣu',
      ig: 'Nyere anyị aka ịmepụta otu okwu ọhụrụ a na-ekwu kwa ọnwa',
      ha: 'Taimaka mana mu kirkiro sabon magana guda kowanne wata'
    },
    impact: {
      en: 'Reaches approximately 500 souls monthly',
      yo: 'De ọdọ ọkan 500 ni ayerọju loṣu',
      ig: 'Na-eru ihe dị ka mkpụrụ obi 500 kwa ọnwa',
      ha: 'Yana kaiwa kusan rayuka 500 kowanne wata'
    }
  },
  {
    amount: 100,
    title: {
      en: 'Language Champion',
      yo: 'Aṣẹgun Ede',
      ig: 'Onye Mmeri Asụsụ',
      ha: 'Jarumin Harshe'
    },
    description: {
      en: 'Sponsor content in all three native languages',
      yo: 'Ṣe atilẹyin akoonu ni gbogbo ede abinibi mẹta',
      ig: 'Kwado ọdịnaya n\'asụsụ obodo atọ ahụ niile',
      ha: 'Dauki nauyin abun ciki a dukan harsuna uku na gida'
    },
    impact: {
      en: 'Reaches approximately 2,000 souls monthly',
      yo: 'De ọdọ ọkan 2,000 ni ayerọju loṣu',
      ig: 'Na-eru ihe dị ka mkpụrụ obi 2,000 kwa ọnwa',
      ha: 'Yana kaiwa kusan rayuka 2,000 kowanne wata'
    }
  },
  {
    amount: 250,
    title: {
      en: 'Ministry Partner',
      yo: 'Alabaṣiṣẹpọ Iṣẹ',
      ig: 'Onye Mmekọ Ozi',
      ha: 'Abokin Aikin Wa\'azi'
    },
    description: {
      en: 'Full support for content creation and outreach',
      yo: 'Atilẹyin kikun fun ṣiṣe akoonu ati iṣẹ-ọrọ',
      ig: 'Nkwado zuru ezu maka imepụta ọdịnaya na mgbasa ozi',
      ha: 'Cikakken tallafi don kirkiro abun ciki da kai da kawo'
    },
    impact: {
      en: 'Reaches approximately 5,000 souls monthly',
      yo: 'De ọdọ ọkan 5,000 ni ayerọju loṣu',
      ig: 'Na-eru ihe dị ka mkpụrụ obi 5,000 kwa ọnwa',
      ha: 'Yana kaiwa kusan rayuka 5,000 kowanne wata'
    }
  }
];

export const teamMembers: TeamMember[] = [
  {
    name: 'Pastor Emmanuel Adebayo',
    role: {
      en: 'Founder & Lead Speaker',
      yo: 'Adasilẹ ati Asọrọ Akọkọ',
      ig: 'Onye Ntọala na Onye Ndu Okwu',
      ha: 'Wanda Ya Kafa da Shugaban Magana'
    },
    bio: {
      en: 'Called to ministry over 15 years ago, Pastor Emmanuel has a heart for reaching souls through powerful spoken word ministry in native languages.',
      yo: 'Ti a pe si iṣẹ-ọrọ ni ọdun 15 sẹhin, Pastor Emmanuel ni ọkan fun dide ọdọ awọn ọkan nipasẹ iṣẹ ọrọ ti a sọ ti o lagbara ni awọn ede abinibi.',
      ig: 'Akpọrọ ya n\'ozi ihe karịrị afọ 15 gara aga, Pasita Emmanuel nwere obi maka iru mkpụrụ obi aka site n\'ozi okwu a na-ekwu dị ike n\'asụsụ obodo.',
      ha: 'Da aka kira shi aikin wa\'azi sama da shekaru 15 da suka wuce, Pastor Emmanuel yana da zuciya don kaiwa rayuka ta hanyar aikin magana mai karfi da harsuna na gida.'
    },
    image: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  },
  {
    name: 'Dcn Isaac O. Samuel',
    role: {
      en: 'Clergyman, Full-time Pastor at Celestial Church of Christ',
      yo: 'Alakoso Ijo, Pastor Kikun ni Ijo Celestial Church of Christ',
      ig: 'Onye Uka, Onye Nchụaja Oge Niile na Celestial Church of Christ',
      ha: 'Limamin Coci, Fasto Na Cikakke A Celestial Church of Christ'
    },
    bio: {
      en: 'Dcn Isaac O. Samuel serves as the Hausa representative for God Will Provide Outreach Ministry. Though originally from Ogun State in Southwestern Nigeria, Isaac was born and raised in Northern Nigeria, where he developed fluency in the Hausa language.',
      yo: 'Dcn Isaac O. Samuel ṣiṣẹ bi aṣoju Hausa fun God Will Provide Outreach Ministry. Botilẹjẹpe o wa lati Ipinlẹ Ogun ni Guusu-iwọ-oorun Naijiria, Isaac ni a bi ati dagba ni Ariwa Naijiria.',
      ig: 'Dcn Isaac O. Samuel na-arụ ọrụ dị ka onye nnọchi anya Hausa maka God Will Provide Outreach Ministry. Ọ bụ ezie na ọ si na Ogun State na Ndịda Ọdịda Anyanwụ Naịjirịa, a mụrụ Isaac ma zụlite ya na Northern Nigeria.',
      ha: 'Dcn Isaac O. Samuel yana aiki a matsayin wakilin Hausa na God Will Provide Outreach Ministry. Ko da yake asalinsa daga Jihar Ogun a Kudu maso Yammacin Najeriya, an haifi Isaac kuma ya girma a Arewacin Najeriya.'
    },
    image: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  }
];