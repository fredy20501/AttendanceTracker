module.exports = {
    devServer: {
        compress: true,
        public: process.env.NODE_ENV === 'production' ? 'athena.xn--9xa.network' : ''
    }
}
