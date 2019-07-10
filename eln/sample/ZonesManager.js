import API from 'src/util/api';

export class ZonesManager {
  constructor(zones, options = {}) {
    this.zones = zones;
    this.currentZone = undefined;
  }

  processAction(action) {
    if (!action.value.event.altKey) return;
    let track;
    if (action.value && action.value.data) {
      let firstChart = Object.keys(action.value.data)[0];
      if (firstChart) {
        track = action.value.data[firstChart];
      }
    }
    if (!track) return;
    switch (action.name) {
      case 'trackClicked':
        this.updateZone(track);
        break;
      case 'trackMove':
        this.updateAnnotations(track);
        break;
      default:
    }
  }

  updateAnnotations(track) {
    if (!this.zones || this.zones.length === 0) {
      API.createData('zoneAnnotations', []);
      return;
    }
    let annotations = [];
    for (let zone of this.zones) {
      if (zone.to) {
        let annotation = {
          position: [{ x: zone.from, y: '15px' }, { x: zone.to, y: '20px' }],
          type: 'rect',
          fillColor: 'red',
          strokeColor: 'red',
          _highlight: [zone._highlight],
          info: zone
        };
        if (zone.label) {
          annotation.label = [
            {
              text: zone.label,
              size: '18px',
              anchor: 'middle',
              color: 'red',
              position: {
                x: (zone.from + zone.to) / 2,
                y: '10px'
              }
            }
          ];
        }
        annotations.push(annotation);
      }
    }
    if (this.currentZone && !this.currentZone.to) {
      annotations.push({
        position: [
          { x: this.currentZone.from, y: '15px' },
          { x: track.xClosest, y: '20px' }
        ],
        type: 'rect',
        fillColor: 'green',
        strokeColor: 'green'
      });
    }
    API.createData('zoneAnnotations', annotations);
  }

  updateZone(track) {
    if (this.currentZone) {
      this.currentZone.to = track.xClosest;
      checkFromTo(this.currentZone);
      this.currentZone = undefined;
    } else {
      let zone = {};
      this.zones.push(zone);
      this.currentZone = zone;
      zone.from = track.xClosest;
      this.zones.triggerChange();
    }
    this.zones.triggerChange();
    this.updateAnnotations();
  }
}

function checkFromTo(zone) {
  if (zone.to === undefined) return;
  if (zone.from > zone.to) [zone.from, zone.to] = [zone.to, zone.from];
}

module.exports = ZonesManager;
