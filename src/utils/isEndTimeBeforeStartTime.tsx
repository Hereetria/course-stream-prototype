const isEndTimeBeforeStartTime = (start: string, end: string): boolean => {
  const startValue = parseInt(start.replace(":", ""));
  const endValue = parseInt(end.replace(":", ""));
  return endValue <= startValue;
};

export default isEndTimeBeforeStartTime;
