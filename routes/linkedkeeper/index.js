const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const id = ctx.params.id;

    const res = await axios({
        method: 'get',
        url: `http://www.linkedkeeper.com/list/${type}.action`,
        params: {
            sid: id,
            tid: id,
        },
        headers: {
            'User-Agent': config.ua,
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('tbody').find('td');

    ctx.state.data = {
        title: `${$('.blog_en_title')
            .text()
            .trim() ||
            $('.active')
                .text()
                .trim()} - LinkedKeeper`,
        link: res.request.res.responseUrl,
        item: list
            .map((index, item) => {
                item = $(item);
                const pubDate = new Date(
                    item
                        .find('dd:nth-child(3)')
                        .text()
                        .trim()
                        .replace('月', '-')
                        .replace('日', '')
                );
                pubDate.setFullYear(new Date().getFullYear());
                return {
                    title: item
                        .find('a.blog_weight')
                        .text()
                        .trim(),
                    description: `${item
                        .find('a.blog_weight')
                        .text()
                        .trim()} - ${item
                        .find('.blog_author_13')
                        .text()
                        .trim()}`,
                    pubDate: pubDate.toUTCString(),
                    link: `http://www.linkedkeeper.com${item.find('a').attr('href')}`,
                };
            })
            .get(),
    };
};
