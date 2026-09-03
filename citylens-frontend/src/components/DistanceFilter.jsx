import './DistanceFilter.css';

const distances = [
    {label: '500m', value: 500},
    {label: '1km', value: 1000},
    {label: '1.5km', value: 1500},
    {label: '2km', value: 2000},
];

const DistanceFilter = ({ activeDistance, onSelectDistance }) => {
    return (
        <div className="distance-filter-container">
            {distances.map((d) => (
                <button
                   key={d.value}
                   className={`distance-pill ${activeDistance === d.value ? 'active' : ''}`}
                   onClick={() => {
                      if (activeDistance === d.value) {
                        onSelectDistance(1200);
                      }
                      else {
                        onSelectDistance(d.value);
                      }
                   }}
                >
                    {d.label}
                </button>
            ))}
        </div>
    );
};

export default DistanceFilter;