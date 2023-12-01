function random_string() {
    return parseInt(Math.random().toString().split(".")?.[1] as string)
        .toString(16)
        .split(".")?.[0] as string;
}

export default random_string;
