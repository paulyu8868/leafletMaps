import { LightningElement, track } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import LEAFLET_CSS from '@salesforce/resourceUrl/leafletCSS';
import LEAFLET_JS from '@salesforce/resourceUrl/leafletJS';

export default class SimpleLeafletMap extends LightningElement {
    @track isLoading = false;
    @track errorMessage = '';
    @track activeFilters = new Set(['headquarters', 'event', 'account', 'lead', 'campaign', 'location']);
    @track isMapInitialized = false;
    
    map;
    markerLayers = {};
    
    // 샘플 데이터
    sampleData = {
        headquarters: [
            { lat: 37.4449168, lng: 127.1388684, name: '본사', description: '텐엑스타워' }
        ],
        event: [
            { lat: 37.5665, lng: 126.9780, name: '세일즈포스 워크샵', description: '세일즈포스 전략 워크샵' },
            { lat: 37.5172, lng: 127.0473, name: '고객 미팅', description: '주요 고객사 미팅' }
        ],
        account: [
            { lat: 37.5230, lng: 126.9244, name: '삼성전자', description: '파트너 기업', isPartner: true },
            { lat: 37.5662, lng: 126.9779, name: 'LG전자', description: '고객사', isPartner: false }
        ],
        lead: [
            { lat: 37.5505, lng: 126.9882, name: '김철수', description: '신규 리드', isNew: true },
            { lat: 37.5407, lng: 127.0699, name: '이영희', description: '잠재 고객', isNew: false }
        ],
        campaign: [
            { lat: 37.5596, lng: 126.9927, name: '디지털 마케팅', description: '온라인 캠페인', memberCount: 15 },
            { lat: 37.5158, lng: 127.1034, name: '제품 론칭', description: '신제품 출시', memberCount: 8 }
        ],
        location: [
            { lat: 37.5665, lng: 126.9780, name: '현재 위치', description: 'GPS 기반 위치' }
        ]
    };
    
    // 기본 중심점
    defaultCenter = {
        lat: 37.5665,
        lng: 126.9780
    };

    connectedCallback() {
        this.loadLeafletResources();
    }

    // Leaflet 리소스 로딩
    async loadLeafletResources() {
        try {
            await Promise.all([
                loadStyle(this, LEAFLET_CSS),
                loadScript(this, LEAFLET_JS)
            ]);
            
            console.log('Leaflet 리소스 로딩 완료');
            this.initializeMap();
        } catch (error) {
            console.error('Leaflet 리소스 로딩 실패:', error);
            this.errorMessage = 'Leaflet 라이브러리를 불러올 수 없습니다.';
        }
    }

    // 지도 초기화
    initializeMap() {
        try {
            const mapContainer = this.template.querySelector('.map-div');
            
            if (!mapContainer) {
                console.error('지도 컨테이너를 찾을 수 없습니다');
                return;
            }

            // Leaflet 지도 생성
            this.map = L.map(mapContainer).setView([this.defaultCenter.lat, this.defaultCenter.lng], 11);

            // OpenStreetMap 타일 레이어 추가
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // 마커 레이어 그룹 초기화
            this.initializeMarkerLayers();
            
            // 샘플 마커들 추가
            this.addSampleMarkers();
            
            this.isMapInitialized = true;
            console.log('지도 초기화 완료');
            
        } catch (error) {
            console.error('지도 초기화 실패:', error);
            this.errorMessage = '지도를 초기화할 수 없습니다.';
        }
    }

    // 마커 레이어 그룹 초기화
    initializeMarkerLayers() {
        const markerTypes = ['headquarters', 'event', 'account', 'lead', 'campaign', 'location'];
        
        markerTypes.forEach(type => {
            this.markerLayers[type] = L.layerGroup().addTo(this.map);
        });
    }

    // 샘플 마커들 추가
    addSampleMarkers() {
        // 본사 마커
        this.sampleData.headquarters.forEach(item => {
            const marker = this.createHeadquartersMarker(item.lat, item.lng, item.name, item.description);
            this.markerLayers.headquarters.addLayer(marker);
        });

        // 이벤트 마커
        this.sampleData.event.forEach(item => {
            const marker = this.createEventMarker(item.lat, item.lng, item.name, item.description);
            this.markerLayers.event.addLayer(marker);
        });

        // 어카운트 마커
        this.sampleData.account.forEach(item => {
            const marker = this.createAccountMarker(item.lat, item.lng, item.name, item.description, item.isPartner);
            this.markerLayers.account.addLayer(marker);
        });

        // 리드 마커
        this.sampleData.lead.forEach(item => {
            const marker = this.createLeadMarker(item.lat, item.lng, item.name, item.description, item.isNew);
            this.markerLayers.lead.addLayer(marker);
        });

        // 캠페인 마커
        this.sampleData.campaign.forEach(item => {
            const marker = this.createCampaignMarker(item.lat, item.lng, item.name, item.description, item.memberCount);
            this.markerLayers.campaign.addLayer(marker);
        });

        // 현재 위치 마커
        this.sampleData.location.forEach(item => {
            const marker = this.createCurrentLocationMarker(item.lat, item.lng, item.name, item.description);
            this.markerLayers.location.addLayer(marker);
        });
    }

    // 본사 마커 생성
    createHeadquartersMarker(lat, lng, name, description) {
        const icon = L.divIcon({
            html: `
                <div class="marker headquarters">
                    <div class="marker-icon"></div>
                    <div class="marker-label">${name}</div>
                </div>
            `,
            className: 'custom-marker-container',
            iconSize: [50, 60],
            iconAnchor: [25, 50]
        });
        
        return L.marker([lat, lng], { icon: icon })
            .bindPopup(`<strong>${name}</strong><br>${description}`);
    }

    // 이벤트 마커 생성
    createEventMarker(lat, lng, name, description) {
        const icon = L.divIcon({
            html: `
                <div class="marker event">
                    <div class="marker-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                    </div>
                    <div class="marker-pulse"></div>
                </div>
            `,
            className: 'custom-marker-container',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        return L.marker([lat, lng], { icon: icon })
            .bindPopup(`<strong>이벤트</strong><br>${name}<br>${description}`);
    }

    // 어카운트 마커 생성
    createAccountMarker(lat, lng, name, description, isPartner) {
        const badge = isPartner ? '<div class="marker-badge">P</div>' : '';
        const icon = L.divIcon({
            html: `
                <div class="marker account">
                    <div class="marker-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    ${badge}
                </div>
            `,
            className: 'custom-marker-container',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        const type = isPartner ? '파트너' : '고객사';
        return L.marker([lat, lng], { icon: icon })
            .bindPopup(`<strong>${type}</strong><br>${name}<br>${description}`);
    }

    // 리드 마커 생성
    createLeadMarker(lat, lng, name, description, isNew) {
        const status = isNew ? '<div class="marker-status new"></div>' : '';
        const icon = L.divIcon({
            html: `
                <div class="marker lead">
                    <div class="marker-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    ${status}
                </div>
            `,
            className: 'custom-marker-container',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        const label = isNew ? '리드 (신규)' : '리드';
        return L.marker([lat, lng], { icon: icon })
            .bindPopup(`<strong>${label}</strong><br>${name}<br>${description}`);
    }

    // 캠페인 마커 생성
    createCampaignMarker(lat, lng, name, description, memberCount) {
        const icon = L.divIcon({
            html: `
                <div class="marker campaign">
                    <div class="marker-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <div class="marker-count">${memberCount}</div>
                </div>
            `,
            className: 'custom-marker-container',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        return L.marker([lat, lng], { icon: icon })
            .bindPopup(`<strong>캠페인</strong><br>${name}<br>${description}<br>참여자: ${memberCount}명`);
    }

    // 현재 위치 마커 생성
    createCurrentLocationMarker(lat, lng, name, description) {
        const icon = L.divIcon({
            html: `
                <div class="marker current-location">
                    <div class="marker-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>
                    <div class="marker-ring"></div>
                    <div class="marker-ring-outer"></div>
                </div>
            `,
            className: 'custom-marker-container',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        return L.marker([lat, lng], { icon: icon })
            .bindPopup(`<strong>${name}</strong><br>${description}`);
    }

    // 필터 토글 핸들러
    handleFilterToggle(event) {
        const markerType = event.currentTarget.dataset.markerType;
        
        if (this.activeFilters.has(markerType)) {
            // 비활성화
            this.activeFilters.delete(markerType);
            if (this.markerLayers[markerType]) {
                this.map.removeLayer(this.markerLayers[markerType]);
            }
        } else {
            // 활성화
            this.activeFilters.add(markerType);
            if (this.markerLayers[markerType]) {
                this.map.addLayer(this.markerLayers[markerType]);
            }
        }
        
        // 반응성을 위해 새로운 Set 생성
        this.activeFilters = new Set(this.activeFilters);
    }

    // 버튼 클래스 getter들
    get headquartersButtonClass() {
        const baseClass = 'slds-button slds-button_neutral';
        return this.activeFilters.has('headquarters') ? `${baseClass} active` : baseClass;
    }

    get eventButtonClass() {
        const baseClass = 'slds-button slds-button_neutral';
        return this.activeFilters.has('event') ? `${baseClass} active` : baseClass;
    }

    get accountButtonClass() {
        const baseClass = 'slds-button slds-button_neutral';
        return this.activeFilters.has('account') ? `${baseClass} active` : baseClass;
    }

    get leadButtonClass() {
        const baseClass = 'slds-button slds-button_neutral';
        return this.activeFilters.has('lead') ? `${baseClass} active` : baseClass;
    }

    get campaignButtonClass() {
        const baseClass = 'slds-button slds-button_neutral';
        return this.activeFilters.has('campaign') ? `${baseClass} active` : baseClass;
    }

    get locationButtonClass() {
        const baseClass = 'slds-button slds-button_neutral';
        return this.activeFilters.has('location') ? `${baseClass} active` : baseClass;
    }

    // 현재 표시된 마커 수 계산
    get visibleMarkersCount() {
        let count = 0;
        Object.keys(this.sampleData).forEach(type => {
            if (this.activeFilters.has(type)) {
                count += this.sampleData[type].length;
            }
        });
        return count;
    }
}
