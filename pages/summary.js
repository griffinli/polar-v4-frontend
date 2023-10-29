import axios from 'axios';
import React from 'react';
import { debounce } from 'lodash';
import styles from '../styles/base.module.css'
import appleStyles from '../styles/apple.module.css'

export default function Home() {

    const [responseData, setResponseData] = React.useState([]);
    const [question, setQuestion] = React.useState();


    const debouncedUpdateQuestion = React.useMemo(
        () => debounce((event) => setQuestion(event.target.value), 300)
        , []);

    React.useEffect(() => {
        function updateResults() {

            if (question) {

                axios.post('/api/apple/search-summary', {"question": question})
                    .then(function (response) {
                        setResponseData(response.data)
                    })
                    .catch(function (error) {
                    });

            }
        }

        updateResults()
    }, [question])



    function showAnswers(event) {

        if (event.target.lastChild.style.display === "block") {
            event.target.lastChild.style.display = "none"
        } else {
            event.target.lastChild.style.display = "block"
        }

    }

    const nest = (items, id = null, link = 'responseId') =>
        items
            .filter(item => item[link] === id)
            .map(item => ({ ...item, children: nest(items, item.id) }));


    function getAnswers(thread) {


        let entries = []
        let question = thread["question"]
        question["responseId"] = null

        entries.push(question)
        entries.push(...thread["answers"])

        console.log(entries)
        let tree = nest(entries)

        return tree[0].children
    }

    function AnswersTreeAll(props) {

        function visit(node) {
            return (
                <>
                    <Answer label={node.label} upvoteCount={node.upvoteCount} text={node.text} key={node.id} id={node.id}>{node.children.map(visit)}</Answer>

                </>
            )
        }

        let threads = props.threads

        // call getAnswers on each thread and flatten the results
        let allAnswers = threads.map((thread) => getAnswers(thread)).flat()

        return allAnswers.sort((a, b) => b.upvoteCount - a.upvoteCount).map(visit)
    }

    function Answer(props) {
        if (props.label === "solution") {
            return (
                <div className={styles.answer} key={props.id}>
                    <p className={styles.votes}>{props.upvoteCount} votes</p>
                    <div dangerouslySetInnerHTML={{__html: props.text}}></div>
                    {props.children}
                </div>
            )
        } else {
            return (
                <div className={styles.other} key={props.id}>
                    <p className={styles.votes}>{props.upvoteCount} votes</p>
                    <div dangerouslySetInnerHTML={{__html: props.text}}></div>
                    {props.children}
                </div>
            )
        }
    }

    return (
        <>
            <div className={styles.question_container}>
                <textarea id="question" className={styles.question} onChange={debouncedUpdateQuestion} autoFocus />
            </div>

            <div className={styles.results_container}>
                {responseData.map((cluster, index) =>
                    <div className={appleStyles.cluster} key={index}>

                        <div className={appleStyles.result} onClick={showAnswers} key={index}>
                            <h3>{cluster.clusters[0].question.textSummary}</h3>

                            <div className={styles.answers}>
                                <AnswersTreeAll threads={cluster.clusters} />
                            </div>

                        </div>

                    </div>
                )}
            </div>
        </>

    )


}