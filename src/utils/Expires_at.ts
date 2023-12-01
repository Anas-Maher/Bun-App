const Expires_at = (seconds: number) =>
    (Date.now() + seconds * 1000).toString();
export default Expires_at;
