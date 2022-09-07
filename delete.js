// Deleting user from the database:
app.delete('/user', async (request, response, next) => {
  try {

    const deleteUserId = request.body.userId;

    await User.findByIdAndDelete(deleteUserId);
    response.status(200).send("Success");



  }
  catch (error) {
    next(error);
  }
})