import React, { Component } from 'react';
import { API, Storage } from 'aws-amplify';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import LoaderButton from './../components/LoaderButton';
import config from './../config';
import './Notes.css';

export default class Notes extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = { 
            note: null,
            content: '',
            attachmentURL: null,
            isLoading: null,
            isDeleting: null,
        };
    }

    async componentDidMount() {
        try {
            let attachmentURL;
            const note = await this.getNote();
            const { content, attachment } = note;

            if (attachment) {
                attachmentURL = await Storage.vault.get(attachment);
            }

            this.setState({ note, content, attachmentURL });
        } catch (err) {
            alert(err);
        }
    }

    getNote() {
        return API.get('notes', `/notes/${this.props.match.params.id}`);
    }

    validateForm() {
        return this.state.content.length > 0;
    }

    formatFilename(str) {
        return str.replace(/^\w+-/, "");
    }

    handleChange = event => {
        this.setState({ [event.target.id]: event.target.value });
    }

    handleFileChange = async event => {
        event.preventDefault();

        if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
            alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`);
            return;
        }

        this.setState({ isLoading: true });
    }

    handleDelete = async event => {
        event.preventDefault();

        const confirmed = window.confirm('Are you sure you want to delete this note?');

        if (!confirmed) {
            return;
        }

        this.setState({ isDeleting: true });
    }

    render() {
        return (
            <div className="Notes">
                {this.state.note &&
                    <form onSubmit={this.handleSubmit}>
                    <FormGroup controlId="content">
                        <FormControl
                        onChange={this.handleChange}
                        value={this.state.content}
                        componentClass="textarea"
                        />
                    </FormGroup>
                    {this.state.note.attachment &&
                        <FormGroup>
                        <ControlLabel>Attachment</ControlLabel>
                        <FormControl.Static>
                            <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={this.state.attachmentURL}
                            >
                            {this.formatFilename(this.state.note.attachment)}
                            </a>
                        </FormControl.Static>
                        </FormGroup>}
                    <FormGroup controlId="file">
                        {!this.state.note.attachment &&
                        <ControlLabel>Attachment</ControlLabel>}
                        <FormControl onChange={this.handleFileChange} type="file" />
                    </FormGroup>
                    <LoaderButton
                        block
                        bsStyle="primary"
                        bsSize="large"
                        disabled={!this.validateForm()}
                        type="submit"
                        isLoading={this.state.isLoading}
                        text="Save"
                        loadingText="Saving…"
                    />
                    <LoaderButton
                        block
                        bsStyle="danger"
                        bsSize="large"
                        isLoading={this.state.isDeleting}
                        onClick={this.handleDelete}
                        text="Delete"
                        loadingText="Deleting…"
                    />
                </form>}
            </div>
        );
    }
}