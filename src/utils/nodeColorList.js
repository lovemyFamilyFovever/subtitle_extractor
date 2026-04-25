const ColorTheme = [
    {
        label: '经典推荐', value: 'classic', colors: [
            { fillColor: '#FD5155', lineColor:'#FD5155', strokeColor: '#FD5155', color: '#333333', customTextWidth: 66 },
            { fillColor: '#FCB52A', lineColor:'#FCB52A', strokeColor: '#FCB52A', color: '#333333', customTextWidth: 66 },
            { fillColor: '#50C28B', lineColor:'#50C28B', strokeColor: '#50C28B', color: '#333333', customTextWidth: 66 },
            { fillColor: '#3679E7', lineColor:'#3679E7', strokeColor: '#3679E7', color: '#333333', customTextWidth: 66 },
            { fillColor: '#9035B2', lineColor:'#9035B2', strokeColor: '#9035B2', color: '#FFFFFF', customTextWidth: 66 },
            { fillColor: '#30304D', lineColor:'#30304D', strokeColor: '#30304D', color: '#FFFFFF', customTextWidth: 66 },
        ]
    },
    {
        label: '复古彩虹', value: 'fugucaihong', colors: [
            { fillColor: '#CF7465', lineColor:'#CF7465', strokeColor: '#CF7465', color: '#333333', customTextWidth: 66 },
            { fillColor: '#DAB16D', lineColor:'#DAB16D', strokeColor: '#DAB16D', color: '#333333', customTextWidth: 66 },
            { fillColor: '#8B9E6F', lineColor:'#8B9E6F', strokeColor: '#8B9E6F', color: '#333333', customTextWidth: 66 },
            { fillColor: '#738BBC', lineColor:'#738BBC', strokeColor: '#738BBC', color: '#333333', customTextWidth: 66 },
            { fillColor: '#9F80B2', lineColor:'#9F80B2', strokeColor: '#9F80B2', color: '#333333', customTextWidth: 66 },
            { fillColor: '#3E4553', lineColor:'#3E4553', strokeColor: '#3E4553', color: '#FFFFFF', customTextWidth: 66 },
        ]
    },
    {
        label: '活力幻彩', value: 'xuancai', colors: [
            { fillColor: '#342850', lineColor:'#342850', strokeColor: '#342850', color: '#FFFFFF', customTextWidth: 66 },
            { fillColor: '#FFFFFF', lineColor:'#FFFFFF', strokeColor: '#FFFFFF', color: '#333333', customTextWidth: 66 },
            { fillColor: '#7249D2', lineColor:'#7249D2', strokeColor: '#7249D2', color: '#FFFFFF', customTextWidth: 66 },
            { fillColor: '#ABD04C', lineColor:'#ABD04C', strokeColor: '#ABD04C', color: '#333333', customTextWidth: 66 },
            { fillColor: '#4D5BDD', lineColor:'#4D5BDD', strokeColor: '#4D5BDD', color: '#FFFFFF', customTextWidth: 66 },
            { fillColor: '#C672EF', lineColor:'#C672EF', strokeColor: '#C672EF', color: '#333333', customTextWidth: 66 },
        ]
    },
    {
        label: '简约商务', value: 'business', colors: [
            { fillColor: '#DCC99F', lineColor:'#DCC99F', strokeColor: '#DCC99F', color: '#333333' },
            { fillColor: '#50B0A8', lineColor:'#50B0A8', strokeColor: '#50B0A8', color: '#333333' },
            { fillColor: '#8CDFFA', lineColor:'#8CDFFA', strokeColor: '#8CDFFA', color: '#333333' },
            { fillColor: '#4396F6', lineColor:'#4396F6', strokeColor: '#4396F6', color: '#333333' },
            { fillColor: '#5C4DD0', lineColor:'#5C4DD0', strokeColor: '#5C4DD0', color: '#FFFFFF' },
            { fillColor: '#020D2B', lineColor:'#020D2B', strokeColor: '#020D2B', color: '#FFFFFF' },
        ]
    },
    {
        label: '柔和雅韵', value: 'soft-rhyme', colors: [
            { fillColor: '#CAD7E3', lineColor:'#CAD7E3', strokeColor: '#CAD7E3', color: '#333333' },
            { fillColor: '#E1B9B9', lineColor:'#E1B9B9', strokeColor: '#E1B9B9', color: '#333333' },
            { fillColor: '#E1D7CB', lineColor:'#E1D7CB', strokeColor: '#E1D7CB', color: '#333333' },
            { fillColor: '#D5E1D7', lineColor:'#D5E1D7', strokeColor: '#D5E1D7', color: '#333333' },
            { fillColor: '#6E8A79', lineColor:'#6E8A79', strokeColor: '#6E8A79', color: '#333333' },
            { fillColor: '#284F78', lineColor:'#284F78', strokeColor: '#284F78', color: '#FFFFFF' },
        ]
    },
    {
        label: '紫红瑰丽', value: 'purple-red', colors: [
            { fillColor: '#EB7890', lineColor:'#EB7890', strokeColor: '#EB7890', color: '#333333' },
            { fillColor: '#F8ADBA', lineColor:'#F8ADBA', strokeColor: '#F8ADBA', color: '#333333' },
            { fillColor: '#FDC0A5', lineColor:'#FDC0A5', strokeColor: '#FDC0A5', color: '#333333' },
            { fillColor: '#CDA2E1', lineColor:'#CDA2E1', strokeColor: '#CDA2E1', color: '#333333' },
            { fillColor: '#676492', lineColor:'#676492', strokeColor: '#676492', color: '#FFFFFF' },
            { fillColor: '#4C4042', lineColor:'#4C4042', strokeColor: '#4C4042', color: '#FFFFFF' },
        ]
    },
    {
        label: '活力对撞', value: 'dynamic-collision', colors: [
            { fillColor: '#EC662D', lineColor:'#EC662D', strokeColor: '#EC662D', color: '#333333' },
            { fillColor: '#90C43C', lineColor:'#90C43C', strokeColor: '#90C43C', color: '#333333' },
            { fillColor: '#F3CF4F', lineColor:'#F3CF4F', strokeColor: '#F3CF4F', color: '#333333' },
            { fillColor: '#59C1E7', lineColor:'#59C1E7', strokeColor: '#59C1E7', color: '#333333' },
            { fillColor: '#366AE5', lineColor:'#366AE5', strokeColor: '#366AE5', color: '#FFFFFF' },
            { fillColor: '#000000', lineColor:'#000000', strokeColor: '#000000', color: '#FFFFFF' },
        ]
    },
    {
        label: '浪漫樱花', value: 'romantic-sakura', colors: [
            { fillColor: '#F430A2', lineColor:'#F430A2', strokeColor: '#F430A2', color: '#333333' },
            { fillColor: '#FFF5FF', lineColor:'#FFF5FF', strokeColor: '#FFF5FF', color: '#333333' },
            { fillColor: '#FAE335', lineColor:'#FAE335', strokeColor: '#FAE335', color: '#333333' },
            { fillColor: '#FD6BBD', lineColor:'#FD6BBD', strokeColor: '#FD6BBD', color: '#333333' },
            { fillColor: '#F5B7FF', lineColor:'#F5B7FF', strokeColor: '#F5B7FF', color: '#333333' },
            { fillColor: '#FFDEF3', lineColor:'#FFDEF3', strokeColor: '#FFDEF3', color: '#333333' },
        ]
    },
    {
        label: '紫色国韵', value: 'purple-country-rhyme', colors: [
            { fillColor: '#3A1084', lineColor:'#3A1084', strokeColor: '#3A1084', color: '#FFFFFF' },
            { fillColor: '#E9CF85', lineColor:'#E9CF85', strokeColor: '#E9CF85', color: '#333333' },
            { fillColor: '#6D2DDE', lineColor:'#6D2DDE', strokeColor: '#6D2DDE', color: '#FFFFFF' },
            { fillColor: '#945BF9', lineColor:'#945BF9', strokeColor: '#945BF9', color: '#333333' },
            { fillColor: '#C7A7FF', lineColor:'#C7A7FF', strokeColor: '#C7A7FF', color: '#333333' },
            { fillColor: '#F2DAFF', lineColor:'#F2DAFF', strokeColor: '#F2DAFF', color: '#333333' },
        ]
    }
]

export default ColorTheme
