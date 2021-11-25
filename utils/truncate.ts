const truncate = (str: string, max: number = 8) => {
  const array = str.trim().split('');
  const ellipsis = array.length > max ? '...' : '';

  return array.slice(0, max).join('') + ellipsis;
};

export default truncate