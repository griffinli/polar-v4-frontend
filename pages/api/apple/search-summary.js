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

    let response = await axios.get(`${process.env.EMBEDDING_URL}/embedding?q=${question}`)

    let knn = {
        "field": "cluster_vector",
        "query_vector": response.data.embedding,
        "k": 10,
        "num_candidates": 10000
    }

    const results = await client.search({
        index: 'apple',
        knn: knn,
        _source: [
            "clusters.question.id",
            "clusters.answers.id",
            "clusters.answers.responseId",
            "clusters.answers.upvoteCount",
            "clusters.answers.text",
            "clusters.answers.label",
            "clusters.question.textSummary",
        ]
    })

    res.json(results.hits.hits.map((hit) => hit["_source"]))
}