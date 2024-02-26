const { ObjectId } = require('mongoose').Types;
const { Reaction, Thought } = require('../models');

// Aggregate function to get the number of reactions overall
const headCount = async () => {
  const numberOfReactions = await Reaction.aggregate()
    .count('reactionCount');
  return numberOfReactions;
}


const grade = async (reactionId) =>
  Reaction.aggregate([

    { $match: { _id: new ObjectId(reactionId) } },
    {
      $unwind: '$users',
    },
    {
      $group: {
        _id: new ObjectId(reactionId),
        overallGrade: { $avg: '$user.score' },
      },
    },
  ]);

module.exports = {
  // Get all students
  async getReaction(req, res) {
    try {
      const reactions = await Reaction.find();

      const reactionObj = {
        reactions,
        headCount: await headCount(),
      };

      res.json(reactionObj);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  // Get a single student
  async getSingleReaction(req, res) {
    try {
      const reaction = await Reaction.findOne({ _id: req.params.reactionId })
        .select('-__v');

      if (!reaction) {
        return res.status(404).json({ message: 'No reaction with that ID' })
      }

      res.json({
        reaction,
        grade: await grade(req.params.reactionId),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  
  async createReaction(req, res) {
    try {
      const reaction = await Reaction.create(req.body);
      res.json(reaction);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Delete a student and remove them from the course
  async deleteReaction(req, res) {
    try {
      const reaction = await Reaction.findOneAndRemove({ _id: req.params.reactionId });

      if (!reaction) {
        return res.status(404).json({ message: 'No such reaction exists' });
      }

      const thought = await Thought.findOneAndUpdate(
        { reaction: req.params.reactionId },
        { $pull: { reactions: req.params.reactionId } },
        { new: true }
      );

      if (!thought) {
        return res.status(404).json({
          message: 'reaction deleted, but no thought found',
        });
      }

      res.json({ message: 'Reaction successfully deleted' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  // Add an assignment to a student
  async addUser(req, res) {
    console.log('You are adding an user');
    console.log(req.body);

    try {
      const reaction = await Reaction.findOneAndUpdate(
        { _id: req.params.reactionId },
        { $addToSet: { user: req.body } },
        { runValidators: true, new: true }
      );

      if (!reaction) {
        return res
          .status(404)
          .json({ message: 'No reaction found with that ID :(' });
      }

      res.json(reaction);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Remove assignment from a student
  async removeUser(req, res) {
    try {
      const reaction = await Reaction.findOneAndUpdate(
        { _id: req.params.reactionId },
        { $pull: { user: { userId: req.params.userId } } },
        { runValidators: true, new: true }
      );

      if (!reaction) {
        return res
          .status(404)
          .json({ message: 'No reaction found with that ID :(' });
      }

      res.json(reaction);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
