export const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500";
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "";
    }
  };