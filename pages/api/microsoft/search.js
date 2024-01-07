import {format} from "date-fns";

const { Client } = require('@elastic/elasticsearch')
import axios from 'axios';

const base64String = process.env.ELASTIC_CERT;
const buffer = Buffer.from(base64String, 'base64');
const cert = buffer.toString('utf-8');

const client = new Client({
    node: process.env.ELASTIC_URL,
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD
    },
    tls: {
        ca: cert,
        rejectUnauthorized: false
    }
})

export default async function handler(req, res) {
    const { question } = req.body;
    const { date } = req.body;

    let dateRange = {}

    if (date === "5-years") {
        dateRange = {
            "lt": format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            "gt": format(new Date().setFullYear(new Date().getFullYear() - 5), 'yyyy-MM-dd\'T\'HH:mm:ss')
        }
    } else if (date === "10-years") {
        dateRange = {
            "lt": format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            "gt": format(new Date().setFullYear(new Date().getFullYear() - 10), 'yyyy-MM-dd\'T\'HH:mm:ss')
        }
    } else if (date === "all") {
        dateRange = {}
    }


    let response = await axios.get(`${process.env.EMBEDDING_URL}/embedding?q=${question}`)

    let knn = {
        "field": "text_vector",
        "query_vector": response.data.embedding,
        "k": 10,
        "num_candidates": 10000,
        "filter": [
            {"nested": {
                    "path": "question",
                    "query": {
                        "bool": {
                            "must": [
                                { "range": {
                                        "question.dateCreated": dateRange
                                }}
                            ]
                        }
                    },
                    "score_mode": "avg"
                }}
        ]

    }

    const results = await client.search({
        index: 'microsoft',
        knn: knn,
        _source: [
            "question.replyCount",
            "question.upvoteCount",
            "question.dateCreated",
            "question.name",
            "question.text",
            "answers.id",
            "answers.parentId",
            "answers.upvoteCount",
            "answers.text",
            "maxUpvotes"
        ]
    })

    res.json(results.hits.hits.map((hit) => hit["_source"]))
}