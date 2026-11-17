import React, { Component } from 'react';
import { Grid } from "@material-ui/core";
import { Button, ButtonGroup } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import './semantic-search.css';

class SemanticSearchPane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      threshold: 0.8,
      loading: false,
      error: ''
    };
  }

  applyFilter = async (event) => {
    event.preventDefault();
    const query = this.state.query.trim();
    if (!query) {
      this.clearSearch();
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/api/semantic/search`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dataset: this.props.datasetDir,
          query: [query],
          threshold: this.state.threshold.toString()
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Semantic search failed.');
      }

      const mask = new Float32Array(this.props.total).fill(1);
      result.indices.forEach((index) => {
        if (index < mask.length) mask[index] = 0;
      });
      this.props.calculateProjection(mask, 'search', true);
      this.setState({ loading: false });
    } catch (error) {
      console.log("received error", error);
      this.setState({ loading: false, error: error.message });
    }
  };

  clearSearch = () => {
    this.setState({ query: '', error: '' });
    const mask = new Float32Array(this.props.total).fill(0);
    this.props.calculateProjection(mask, 'search', true);
  };

  render() {
    const { query, threshold, loading, error } = this.state;
    return (
      <div className="main-container">
        <Grid container spacing={1}>

          <Grid item xs={12}>
            {error && <div className="concept-search__error" role="alert">{error}</div>}
          </Grid>

          <Grid item xs={12}>
            <input
              aria-label="semantic concepts"
              className="full-width"
              value={query}
              onChange={(event) => this.setState({ query: event.target.value })}
              placeholder="semantic concepts"
            />
          </Grid>

          <Grid item xs={4}>
            Similarity:
          </Grid>
          <Grid item xs={6}>
              <input
                aria-label="Similarity threshold"
                type="range"
                min="0.05"
                max="0.80"
                step="0.01"
                value={threshold}
                className="full-width"
                onChange={(event) => this.setState({ threshold: Number(event.target.value) })}
              />
          </Grid>
          <Grid item xs={2}>
            <span className="full-width">{threshold.toFixed(2)}</span>
          </Grid>

          <Grid item xs={12}>
            <ButtonGroup variant="contained">
            <Button onClick={this.applyFilter}>search</Button>
            <Button onClick={this.clearSearch}>reset</Button>
            </ButtonGroup>
          </Grid>

          <Grid item xs={12}>
            {
              this.state.loading &&
              <div><CircularProgress color="inherit"/><div>searching...</div></div>
            }
          </Grid>

        </Grid>
      </div>
    );
  }
}

export default SemanticSearchPane;
