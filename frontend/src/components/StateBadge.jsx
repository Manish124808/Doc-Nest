const StateBadge = ({ icon, value }) => {
  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur px-2 py-1 rounded-full shadow text-xs">
      <img src={icon} alt="" className="w-3 h-3" />
      <span>{value}</span>
    </div>
  );
};

export default StateBadge;