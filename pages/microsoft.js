import axios from 'axios';
import React from 'react';
import { debounce } from 'lodash';
import styles from '../styles/base.module.css'
import microsoftStyles from '../styles/microsoft.module.css'

export default function Home() {

    const [responseData, setResponseData] = React.useState([]);
    const [date, setDate] = React.useState("5-years");
    const [question, setQuestion] = React.useState();


    const debouncedUpdateQuestion = React.useMemo(
        () => debounce((event) => setQuestion(event.target.value), 300)
        , []);

    React.useEffect(() => {
        function updateResults() {

            if (question) {

                axios.post('/api/microsoft/search', {"question": question, "date": date})
                    .then(function (response) {
                        setResponseData(response.data)
                    })
                    .catch(function (error) {
                    });

            }
        }

        updateResults()
    }, [date, question])



    function showAnswers(event) {
        console.log(event)
        if (event.target.lastChild.style.display === "block") {
            event.target.lastChild.style.display = "none"
        } else {
            event.target.lastChild.style.display = "block"
        }

    }

    const nest = (items, id = null, link = 'parentId') =>
        items
            .filter(item => item[link] === id)
            .map(item => ({ ...item, children: nest(items, item.id) }));


    function AnswersTree(props) {

        let entries = []
        let question = props.result["question"]
        question["id"] = "00000000-0000-0000-0000-000000000000"
        question["parentId"] = null

        entries.push(question)
        entries.push(...props.result["answers"])

        let tree = nest(entries)

        function visit(node) {

            return (
                <>
                    <Answer upvoteCount={node.upvoteCount} text={node.text}>{node.children.map(visit)}</Answer>

                </>
            )
        }

        return tree[0].children.sort((a, b) => b.upvoteCount - a.upvoteCount).map(visit)
    }

    function Answer(props) {
        return (
            <div className={styles.answer}>
                <p className={styles.votes}>{props.upvoteCount} votes</p>
                <div dangerouslySetInnerHTML={{__html: props.text}}></div>
                {props.children}
            </div>
        )
    }

    return (
        <>
            <div className={styles.question_container}>
                <textarea id="question" className={styles.question} onChange={debouncedUpdateQuestion} autoFocus placeholder={"What's your tech problem?"}/>
            </div>

            <div className={styles.filter_container}>
                <select className={styles.filter} name="date" id="date" value={date} onChange={(event) => {
                        setDate(event.target.value);
                    }
                }>
                    <option className={styles.filter_option} value="5-years">Past 5 years</option>
                    <option className={styles.filter_option} value="10-years">Past 10 years</option>
                    <option className={styles.filter_option} value="all">All</option>
                </select>
            </div>

            <div className={styles.results_container}>
                {/*if no responseData, but there is "question": display "loading..." */ }
                {responseData.length === 0 && question && <p className={styles.loading}>Loading...</p>}


                {responseData.map((result, index) =>
                    <div className={microsoftStyles.result} onClick={showAnswers} key={index}>
                        <h3>{result.question.name}</h3>

                        <div className={styles.additional_info}>
                            <h5>Max upvotes: {result.maxUpvotes}</h5>
                            <h5>Replies: {result.question.replyCount}</h5>
                            <h5>Question upvotes: {result.question.upvoteCount}</h5>
                            <h5>{result.question.dateCreated.slice(0,4)}</h5>
                        </div>

                        <div dangerouslySetInnerHTML={{__html: result.question.text}}></div>


                        <div className={styles.answers}>

                            <AnswersTree result={result} />

                        </div>
                    </div>
                )}
            </div>
        </>

    )


}